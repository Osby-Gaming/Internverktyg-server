/*
Copyright 2024 Open Foodservice System Consortium

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

// QR Code is a registered trademark of DENSO WAVE INCORPORATED.

export const Receipt = (() => {
    /**
     * Transform receipt markdown to printer commands or SVG images.
     * @param {string} markdown receipt markdown
     * @param {object} [printer] printer configuration
     * @returns {string} printer command or SVG image
     */
    const transform = async (markdown, printer) => {
        // initialize state variables
        const state = {
            wrap: true,
            border: 1,
            width: [],
            align: 1,
            option: { type: 'code128', width: 2, height: 72, hri: false, cell: 3, level: 'l' },
            line: 'waiting',
            rules: { left: 0, width: 0, right: 0, widths: [] }
        };
        // append commands to start printing
        let result = printer.command.open(printer);
        // strip bom
        if (markdown[0] === '\ufeff') {
            markdown = markdown.slice(1);
        }
        // parse each line and generate commands
        const res = [];
        for (let line of markdown.normalize().split(/\n|\r\n|\r/)) {
            res.push(await createLine(parseLine(line, state), printer, state));
        }
        // if rules is not finished
        switch (state.line) {
            case 'ready':
                // set state to cancel rules
                state.line = 'waiting';
                break;
            case 'running':
            case 'horizontal':
                // append commands to stop rules
                res.push(printer.command.normal() +
                    printer.command.area(state.rules.left, state.rules.width, state.rules.right) +
                    printer.command.align(0) +
                    printer.command.vrstop(state.rules.widths) +
                    printer.command.vrlf(false));
                state.line = 'waiting';
                break;
            default:
                break;
        }
        // flip upside down
        if (printer.upsideDown) {
            res.reverse();
        }
        // append commands
        result += res.join('');
        // append commands to end printing
        result += printer.command.close();
        return result;
    }

    /**
     * Parse lines.
     * @param {string} columns line text without line breaks
     * @param {object} state state variables
     * @returns {object} parsed line object
     */
    const parseLine = (columns, state) => {
        // extract columns
        const line = columns
            // trim whitespace
            .replace(/^[\t ]+|[\t ]+$/g, '')
            // convert escape characters ('\\', '\{', '\|', '\}') to hexadecimal escape characters
            .replace(/\\[\\{|}]/g, match => '\\x' + match.charCodeAt(1).toString(16))
            // append a space if the first column does not start with '|' and is right-aligned
            .replace(/^[^|]*[^\t |]\|/, ' $&')
            // append a space if the last column does not end with '|' and is left-aligned
            .replace(/\|[^\t |][^|]*$/, '$& ')
            // remove '|' at the beginning of the first column
            .replace(/^\|(.*)$/, '$1')
            // remove '|' at the end of the last column
            .replace(/^(.*)\|$/, '$1')
            // separate text with '|'
            .split('|')
            // parse columns
            .map((column, index, array) => {
                // parsed column object
                let result = {};
                // trim whitespace
                const element = column.replace(/^[\t ]+|[\t ]+$/g, '');
                // determin alignment from whitespaces around column text
                result.align = 1 + Number(/^[\t ]/.test(column)) - Number(/[\t ]$/.test(column));
                // parse properties
                if (/^\{[^{}]*\}$/.test(element)) {
                    // extract members
                    result.property = element
                        // trim property delimiters
                        .slice(1, -1)
                        // convert escape character ('\;') to hexadecimal escape characters
                        .replace(/\\;/g, '\\x3b')
                        // separate property with ';'
                        .split(';')
                        // parse members
                        .reduce((obj, member) => {
                            // abbreviations
                            const abbr = { a: 'align', b: 'border', c: 'code', i: 'image', o: 'option', t: 'text', w: 'width', x: 'command', _: 'comment' };
                            // parse key-value pair
                            if (!/^[\t ]*$/.test(member) &&
                                member.replace(/^[\t ]*([A-Za-z_]\w*)[\t ]*:[\t ]*([^\t ].*?)[\t ]*$/,
                                    (match, key, value) => obj[key.replace(/^[abciotwx_]$/, m => abbr[m])] = parseEscape(value.replace(/\\n/g, '\n'))) === member) {
                                // invalid members
                                result.error = element;
                            }
                            return obj;
                        }, {});
                    // if the column is single
                    if (array.length === 1) {
                        // parse text property
                        if ('text' in result.property) {
                            const c = result.property.text.toLowerCase();
                            state.wrap = !/^nowrap$/.test(c);
                        }
                        // parse border property
                        if ('border' in result.property) {
                            const c = result.property.border.toLowerCase();
                            const border = { 'line': -1, 'space': 1, 'none': 0 };
                            const previous = state.border;
                            state.border = /^(line|space|none)$/.test(c) ? border[c.toLowerCase()] : /^\d+$/.test(c) && Number(c) <= 2 ? Number(c) : 1;
                            // start rules
                            if (previous >= 0 && state.border < 0) {
                                result.vr = '+';
                            }
                            // stop rules
                            if (previous < 0 && state.border >= 0) {
                                result.vr = '-';
                            }
                        }
                        // parse width property
                        if ('width' in result.property) {
                            const width = result.property.width.toLowerCase().split(/[\t ]+|,/);
                            state.width = width.find(c => /^auto$/.test(c)) ? [] : width.map(c => /^\*$/.test(c) ? -1 : /^\d+$/.test(c) ? Number(c) : 0);
                        }
                        // parse align property
                        if ('align' in result.property) {
                            const c = result.property.align.toLowerCase();
                            const align = { 'left': 0, 'center': 1, 'right': 2 };
                            state.align = /^(left|center|right)$/.test(c) ? align[c.toLowerCase()] : 1;
                        }
                        // parse option property
                        if ('option' in result.property) {
                            const option = result.property.option.toLowerCase().split(/[\t ]+|,/);
                            state.option = {
                                type: (option.find(c => /^(upc|ean|jan|code39|itf|codabar|nw7|code93|code128|qrcode)$/.test(c)) || 'code128'),
                                width: Number(option.find(c => /^\d+$/.test(c) && Number(c) >= 2 && Number(c) <= 4) || '2'),
                                height: Number(option.find(c => /^\d+$/.test(c) && Number(c) >= 24 && Number(c) <= 240) || '72'),
                                hri: !!option.find(c => /^hri$/.test(c)),
                                cell: Number(option.find(c => /^\d+$/.test(c) && Number(c) >= 3 && Number(c) <= 8) || '3'),
                                level: (option.find(c => /^[lmqh]$/.test(c)) || 'l')
                            };
                        }
                        // parse code property
                        if ('code' in result.property) {
                            result.code = Object.assign({ data: result.property.code }, state.option);
                        }
                        // parse image property
                        if ('image' in result.property) {
                            const c = result.property.image.replace(/=.*|[^A-Za-z0-9+/]/g, '');
                            switch (c.length % 4) {
                                case 1:
                                    result.image = c.slice(0, -1);
                                    break;
                                case 2:
                                    result.image = c + '==';
                                    break;
                                case 3:
                                    result.image = c + '=';
                                    break;
                                default:
                                    result.image = c;
                                    break;
                            }
                        }
                        // parse command property
                        if ('command' in result.property) {
                            result.command = result.property.command;
                        }
                        // parse comment property
                        if ('comment' in result.property) {
                            result.comment = result.property.comment;
                        }
                    }
                }
                // remove invalid property delimiter
                else if (/[{}]/.test(element)) {
                    result.error = element;
                }
                // parse horizontal rule of special character in text
                else if (array.length === 1 && /^-+$|^=+$/.test(element)) {
                    result.hr = element.slice(-1);
                }
                // parse text
                else {
                    result.text = element
                        // remove control codes and hexadecimal control codes
                        .replace(/[\x00-\x1f\x7f]|\\x[01][\dA-Fa-f]|\\x7[Ff]/g, '')
                        // convert escape characters ('\-', '\=', '\_', '\"', \`', '\^', '\~') to hexadecimal escape characters
                        .replace(/\\[-=_"`^~]/g, match => '\\x' + match.charCodeAt(1).toString(16))
                        // convert escape character ('\n') to LF
                        .replace(/\\n/g, '\n')
                        // convert escape character ('~') to space
                        .replace(/~/g, ' ')
                        // separate text with '_', '"', '`', '^'(1 or more), '\n'
                        .split(/([_"`\n]|\^+)/)
                        // convert escape characters to normal characters
                        .map(text => parseEscape(text));
                }
                // set current text wrapping
                result.wrap = state.wrap;
                // set current column border
                result.border = state.border;
                // set current column width
                if (state.width.length === 0) {
                    // set '*' for all columns when the width property is 'auto'
                    result.width = -1;
                }
                else if ('text' in result) {
                    // text: set column width
                    result.width = index < state.width.length ? state.width[index] : 0;
                }
                else if (state.width.find(c => c < 0)) {
                    // image, code, command: when the width property includes '*', set '*'
                    result.width = -1;
                }
                else {
                    // image, code, command: when the width property does not include '*', set the sum of column width and border width
                    const w = state.width.filter(c => c > 0);
                    result.width = w.length > 0 ? w.reduce((a, c) => a + c, result.border < 0 ? w.length + 1 : (w.length - 1) * result.border) : 0;
                }
                // set line alignment
                result.alignment = state.align;
                return result;
            });
        // if the line is text and the width property is not 'auto'
        if (line.every(el => 'text' in el) && state.width.length > 0) {
            // if the line has fewer columns
            while (line.length < state.width.length) {
                // fill empty columns
                line.push({ align: 1, text: [''], wrap: state.wrap, border: state.border, width: state.width[line.length] });
            }
        }
        return line;
    }

    /**
     * Parse escape characters.
     * @param {string} chars string containing escape characters
     * @returns {string} unescaped string
     */
    const parseEscape = chars => {
        return chars
            // remove invalid escape sequences
            .replace(/\\$|\\x(.?$|[^\dA-Fa-f].|.[^\dA-Fa-f])/g, '')
            // ignore invalid escape characters
            .replace(/\\[^x]/g, '')
            // convert hexadecimal escape characters to normal characters
            .replace(/\\x([\dA-Fa-f]{2})/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    }

    /**
     * Generate commands from line objects.
     * @param {object} line parsed line object
     * @param {object} printer printer configuration
     * @param {object} state state variables
     * @returns {string} printer command fragment or SVG image fragment
     */
    const createLine = async (line, printer, state) => {
        const result = [];
        // text or property
        const text = line.every(el => 'text' in el);
        // the first column
        const column = line[0];
        // remove zero width columns
        let columns = line.filter(el => el.width !== 0);
        // remove overflowing columns
        if (text) {
            columns = columns.slice(0, Math.floor(column.border < 0 ? (printer.cpl - 1) / 2 : (printer.cpl + column.border) / (column.border + 1)));
        }
        // fixed columns
        const f = columns.filter(el => el.width > 0);
        // variable columns
        const g = columns.filter(el => el.width < 0);
        // reserved width
        let u = f.reduce((a, el) => a + el.width, 0);
        // free width
        let v = printer.cpl - u;
        // subtract border width from free width
        if (text && columns.length > 0) {
            v -= column.border < 0 ? columns.length + 1 : (columns.length - 1) * column.border;
        }
        // number of variable columns
        const n = g.length;
        // reduce the width of fixed columns when reserved width is too many
        while (n > v) {
            f.reduce((a, el) => a.width > el.width ? a : el).width--;
            v++;
        }
        // allocate free width among variable columns
        if (n > 0) {
            g.forEach((el, i) => el.width = Math.floor((v + i) / n));
            v = 0;
        }
        // print area
        const left = Math.floor(v * column.alignment / 2);
        const width = printer.cpl - v;
        const right = v - left;
        // process text
        if (text) {
            // wrap text
            const cols = columns.map(column => wrapText(column, printer));
            // vertical line spacing
            const widths = columns.map(column => column.width);
            // rules
            switch (state.line) {
                case 'ready':
                    // append commands to start rules
                    result.push(printer.command.normal() +
                        printer.command.area(left, width, right) +
                        printer.command.align(0) +
                        printer.command.vrstart(widths) +
                        printer.command.vrlf(true));
                    state.line = 'running';
                    break;
                case 'horizontal':
                    // append commands to print horizontal rule
                    const m = left - state.rules.left;
                    const w = width - state.rules.width;
                    const l = Math.min(left, state.rules.left);
                    const r = Math.min(right, state.rules.right);
                    result.push(printer.command.normal() +
                        printer.command.area(l, printer.cpl - l - r, r) +
                        printer.command.align(0) +
                        printer.command.vrhr(state.rules.widths, widths, m, m + w) +
                        printer.command.lf());
                    state.line = 'running';
                    break;
                default:
                    break;
            }
            // save parameters to stop rules
            state.rules = { left: left, width: width, right: right, widths: widths };
            // maximum number of wraps
            const row = column.wrap ? cols.reduce((a, col) => Math.max(a, col.length), 1) : 1;
            // sort text
            for (let j = 0; j < row; j++) {
                // append commands to set print area and line alignment
                let res = printer.command.normal() +
                    printer.command.area(left, width, right) +
                    printer.command.align(0);
                // print position
                let p = 0;
                // process vertical rules
                if (state.line === 'running') {
                    // maximum height
                    const height = cols.reduce((a, col) => j < col.length ? Math.max(a, col[j].height) : a, 1);
                    // append commands to print vertical rules
                    res += printer.command.normal() +
                        printer.command.absolute(p++) +
                        printer.command.vr(widths, height);
                }
                // process each column
                cols.forEach((col, i) => {
                    // append commands to set print position of first column
                    res += printer.command.absolute(p);
                    // if wrapped text is not empty
                    if (j < col.length) {
                        // append commands to align text
                        res += printer.command.relative(col[j].margin);
                        // process text
                        const data = col[j].data;
                        for (let k = 0; k < data.length; k += 2) {
                            // append commands to decorate text
                            const ul = Number(data[k][0]);
                            const em = Number(data[k][1]);
                            const iv = Number(data[k][2]);
                            const wh = Number(data[k][3]);
                            res += printer.command.normal();
                            if (ul) {
                                res += printer.command.ul();
                            }
                            if (em) {
                                res += printer.command.em();
                            }
                            if (iv) {
                                res += printer.command.iv();
                            }
                            if (wh) {
                                res += printer.command.wh(wh);
                            }
                            // append commands to print text
                            res += printer.command.text(data[k + 1], printer.encoding);
                        }
                    }
                    // if wrapped text is empty
                    else {
                        res += printer.command.normal() + printer.command.text(' ', printer.encoding);
                    }
                    // append commands to set print position of next column
                    p += columns[i].width + Math.abs(column.border);
                });
                // append commands to feed new line
                res += printer.command.lf();
                result.push(res);
            }
        }
        // process horizontal rule or paper cut
        if ('hr' in column) {
            // process paper cut
            if (column.hr === '=') {
                switch (state.line) {
                    case 'running':
                    case 'horizontal':
                        // append commands to stop rules
                        result.push(printer.command.normal() +
                            printer.command.area(state.rules.left, state.rules.width, state.rules.right) +
                            printer.command.align(0) +
                            printer.command.vrstop(state.rules.widths) +
                            printer.command.vrlf(false));
                        // append commands to cut paper
                        result.push(printer.command.cut());
                        // set state to start rules
                        state.line = 'ready';
                        break;
                    default:
                        // append commands to cut paper
                        result.push(printer.command.cut());
                        break;
                }
            }
            // process horizontal rule
            else {
                switch (state.line) {
                    case 'waiting':
                        // append commands to print horizontal rule
                        result.push(printer.command.normal() +
                            printer.command.area(left, width, right) +
                            printer.command.align(0) +
                            printer.command.hr(width) +
                            printer.command.lf());
                        break;
                    case 'running':
                        // set state to print horizontal rule
                        state.line = 'horizontal';
                        break;
                    default:
                        break;
                }
            }
        }
        // process rules
        if ('vr' in column) {
            // start rules
            if (column.vr === '+') {
                state.line = 'ready';
            }
            // stop rules
            else {
                switch (state.line) {
                    case 'ready':
                        // set state to cancel rules
                        state.line = 'waiting';
                        break;
                    case 'running':
                    case 'horizontal':
                        // append commands to stop rules
                        result.push(printer.command.normal() +
                            printer.command.area(state.rules.left, state.rules.width, state.rules.right) +
                            printer.command.align(0) +
                            printer.command.vrstop(state.rules.widths) +
                            printer.command.vrlf(false));
                        state.line = 'waiting';
                        break;
                    default:
                        break;
                }
            }
        }
        // process image
        if ('image' in column) {
            // append commands to print image
            result.push(printer.command.normal() +
                printer.command.area(left, width, right) +
                printer.command.align(column.align) +
                await printer.command.image(column.image));
        }
        // process barcode or 2D code
        if ('code' in column) {
            // process 2D code
            if (column.code.type === 'qrcode') {
                // append commands to print 2D code
                result.push(printer.command.normal() +
                    printer.command.area(left, width, right) +
                    printer.command.align(column.align) +
                    printer.command.qrcode(column.code, printer.encoding));
            }
            // process barcode
            else {
                // append commands to print barcode
                result.push(printer.command.normal() +
                    printer.command.area(left, width, right) +
                    printer.command.align(column.align) +
                    printer.command.barcode(column.code, printer.encoding));
            }
        }
        // process command
        if ('command' in column) {
            // append commands to insert commands
            result.push(printer.command.normal() +
                printer.command.area(left, width, right) +
                printer.command.align(column.align) +
                printer.command.command(column.command));
        }
        // flip upside down
        if (printer.upsideDown) {
            result.reverse();
        }
        return result.join('');
    }

    /**
     * Wrap text.
     * @param {object} column parsed column object
     * @param {object} printer printer configuration
     * @returns {object[]} wrapped text, text position, and text height
     */
    const wrapText = (column, printer) => {
        const result = [];
        // remaining spaces
        let space = column.width;
        // text height
        let height = 1;
        // text data
        let res = [];
        // text decoration flags
        let ul = false;
        let em = false;
        let iv = false;
        let wh = 0;
        // process text and text decoration
        column.text.forEach((text, i) => {
            // process text
            if (i % 2 === 0) {
                // if text is not empty
                let t = printer.command.arrayFrom(text, printer.encoding);
                while (t.length > 0) {
                    // measure character width
                    let w = 0;
                    let j = 0;
                    while (j < t.length) {
                        w = printer.command.measureText(t[j], printer.encoding) * (wh < 2 ? wh + 1 : wh - 1);
                        // output before protruding
                        if (w > space) {
                            break;
                        }
                        space -= w;
                        w = 0;
                        j++;
                    }
                    // if characters fit
                    if (j > 0) {
                        // append text decoration information
                        res.push((ul ? '1' : '0') + (em ? '1' : '0') + (iv ? '1' : '0') + wh);
                        // append text
                        res.push(t.slice(0, j).join(''));
                        // update text height
                        height = Math.max(height, wh < 3 ? wh : wh - 1);
                        // remaining text
                        t = t.slice(j);
                    }
                    // if character is too big
                    if (w > column.width) {
                        // do not output
                        t = t.slice(1);
                        continue;
                    }
                    // if there is no spece left
                    if (w > space || space === 0) {
                        // wrap text automatically
                        result.push({ data: res, margin: space * column.align / 2, height: height });
                        space = column.width;
                        res = [];
                        height = 1;
                    }
                }
            }
            // process text decoration
            else {
                // update text decoration flags
                switch (text) {
                    case '\n':
                        // wrap text manually
                        result.push({ data: res, margin: space * column.align / 2, height: height });
                        space = column.width;
                        res = [];
                        height = 1;
                        break;
                    case '_':
                        ul = !ul;
                        break;
                    case '"':
                        em = !em;
                        break;
                    case '`':
                        iv = !iv;
                        break;
                    default:
                        const d = Math.min(text.length, 7);
                        wh = wh === d ? 0 : d;
                        break;
                }
            }
        });
        // output last text
        if (res.length > 0) {
            result.push({ data: res, margin: space * column.align / 2, height: height });
        }
        return result;
    }

    //
    // Barcode generator
    //
    const barcode = (() => {
        // CODE128 patterns:
        const c128 = {
            element: '212222,222122,222221,121223,121322,131222,122213,122312,132212,221213,221312,231212,112232,122132,122231,113222,123122,123221,223211,221132,221231,213212,223112,312131,311222,321122,321221,312212,322112,322211,212123,212321,232121,111323,131123,131321,112313,132113,132311,211313,231113,231311,112133,112331,132131,113123,113321,133121,313121,211331,231131,213113,213311,213131,311123,311321,331121,312113,312311,332111,314111,221411,431111,111224,111422,121124,121421,141122,141221,112214,112412,122114,122411,142112,142211,241211,221114,413111,241112,134111,111242,121142,121241,114212,124112,124211,411212,421112,421211,212141,214121,412121,111143,111341,131141,114113,114311,411113,411311,113141,114131,311141,411131,211412,211214,211232,2331112'.split(','),
            starta: 103, startb: 104, startc: 105, atob: 100, atoc: 99, btoa: 101, btoc: 99, ctoa: 101, ctob: 100, shift: 98, stop: 106
        };
        // generate CODE128 data (minimize symbol width):
        const code128 = symbol => {
            const r = {};
            let s = symbol.data.replace(/((?!^[\x00-\x7f]+$).)*/, '');
            if (s.length > 0) {
                // generate HRI
                r.hri = symbol.hri;
                r.text = s.replace(/[\x00- \x7f]/g, ' ');
                // minimize symbol width
                const d = [];
                const p = s.search(/[^ -_]/);
                if (/^\d{2}$/.test(s)) {
                    d.push(c128.startc, Number(s));
                }
                else if (/^\d{4,}/.test(s)) {
                    code128c(c128.startc, s, d);
                }
                else if (p >= 0 && s.charCodeAt(p) < 32) {
                    code128a(c128.starta, s, d);
                }
                else if (s.length > 0) {
                    code128b(c128.startb, s, d);
                }
                else {
                    // end
                }
                // calculate check digit and append stop character
                d.push(d.reduce((a, c, i) => a + c * i) % 103, c128.stop);
                // generate bars and spaces
                const q = symbol.quietZone ? 'a' : '0';
                const m = d.reduce((a, c) => a + c128.element[c], q) + q;
                r.widths = m.split('').map(c => parseInt(c, 16) * symbol.width);
                r.length = symbol.width * (d.length * 11 + (symbol.quietZone ? 22 : 2));
                r.height = symbol.height;
            }
            return r;
        };
        // process CODE128 code set A:
        const code128a = (x, s, d) => {
            if (x !== c128.shift) {
                d.push(x);
            }
            s = s.replace(/^((?!\d{4,})[\x00-_])+/, m => (m.split('').forEach(c => d.push((c.charCodeAt(0) + 64) % 96)), ''));
            s = s.replace(/^\d(?=(\d\d){2,}(\D|$))/, m => (d.push((m.charCodeAt(0) + 64) % 96), ''));
            const t = s.slice(1);
            const p = t.search(/[^ -_]/);
            if (/^\d{4,}/.test(s)) {
                code128c(c128.atoc, s, d);
            }
            else if (p >= 0 && t.charCodeAt(p) < 32) {
                d.push(c128.shift, s.charCodeAt(0) - 32);
                code128a(c128.shift, t, d);
            }
            else if (s.length > 0) {
                code128b(c128.atob, s, d);
            }
            else {
                // end
            }
        };
        // process CODE128 code set B:
        const code128b = (x, s, d) => {
            if (x !== c128.shift) {
                d.push(x);
            }
            s = s.replace(/^((?!\d{4,})[ -\x7f])+/, m => (m.split('').forEach(c => d.push(c.charCodeAt(0) - 32)), ''));
            s = s.replace(/^\d(?=(\d\d){2,}(\D|$))/, m => (d.push(m.charCodeAt(0) - 32), ''));
            const t = s.slice(1);
            const p = t.search(/[^ -_]/);
            if (/^\d{4,}/.test(s)) {
                code128c(c128.btoc, s, d);
            }
            else if (p >= 0 && t.charCodeAt(p) > 95) {
                d.push(c128.shift, s.charCodeAt(0) + 64);
                code128b(c128.shift, t, d);
            }
            else if (s.length > 0) {
                code128a(c128.btoa, s, d);
            }
            else {
                // end
            }
        };
        // process CODE128 code set C:
        const code128c = (x, s, d) => {
            if (x !== c128.shift) {
                d.push(x);
            }
            s = s.replace(/^\d{4,}/g, m => m.replace(/\d{2}/g, c => (d.push(Number(c)), '')));
            const p = s.search(/[^ -_]/);
            if (p >= 0 && s.charCodeAt(p) < 32) {
                code128a(c128.ctoa, s, d);
            }
            else if (s.length > 0) {
                code128b(c128.ctob, s, d);
            }
            else {
                // end
            }
        };
        // CODE93 patterns:
        const c93 = {
            escape: 'cU,dA,dB,dC,dD,dE,dF,dG,dH,dI,dJ,dK,dL,dM,dN,dO,dP,dQ,dR,dS,dT,dU,dV,dW,dX,dY,dZ,cA,cB,cC,cD,cE, ,sA,sB,sC,$,%,sF,sG,sH,sI,sJ,+,sL,-,.,/,0,1,2,3,4,5,6,7,8,9,sZ,cF,cG,cH,cI,cJ,cV,A,B,C,D,E,F,G,H,I,J,K,L,M,N,O,P,Q,R,S,T,U,V,W,X,Y,Z,cK,cL,cM,cN,cO,cW,pA,pB,pC,pD,pE,pF,pG,pH,pI,pJ,pK,pL,pM,pN,pO,pP,pQ,pR,pS,pT,pU,pV,pW,pX,pY,pZ,cP,cQ,cR,cS,cT'.split(','),
            code: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. $/+%dcsp'.split('').reduce((a, c, i) => (a[c] = i, a), {}),
            element: '131112,111213,111312,111411,121113,121212,121311,111114,131211,141111,211113,211212,211311,221112,221211,231111,112113,112212,112311,122112,132111,111123,111222,111321,121122,131121,212112,212211,211122,211221,221121,222111,112122,112221,122121,123111,121131,311112,311211,321111,112131,113121,211131,121221,312111,311121,122211,111141,1111411'.split(','),
            start: 47, stop: 48
        };
        // generate CODE93 data:
        const code93 = symbol => {
            const r = {};
            let s = symbol.data.replace(/((?!^[\x00-\x7f]+$).)*/, '');
            if (s.length > 0) {
                // generate HRI
                r.hri = symbol.hri;
                r.text = s.replace(/[\x00- \x7f]/g, ' ');
                // calculate check digit
                const d = s.split('').reduce((a, c) => a + c93.escape[c.charCodeAt(0)], '').split('').map(c => c93.code[c]);
                d.push(d.reduceRight((a, c, i) => a + c * ((d.length - 1 - i) % 20 + 1)) % 47);
                d.push(d.reduceRight((a, c, i) => a + c * ((d.length - 1 - i) % 15 + 1)) % 47);
                // append start character and stop character
                d.unshift(c93.start);
                d.push(c93.stop);
                // generate bars and spaces
                const q = symbol.quietZone ? 'a' : '0';
                const m = d.reduce((a, c) => a + c93.element[c], q) + q;
                r.widths = m.split('').map(c => parseInt(c, 16) * symbol.width);
                r.length = symbol.width * (d.length * 9 + (symbol.quietZone ? 21 : 1));
                r.height = symbol.height;
            }
            return r;
        };
        // Codabar(NW-7) patterns:
        const nw7 = {
            '0': '2222255', '1': '2222552', '2': '2225225', '3': '5522222', '4': '2252252',
            '5': '5222252', '6': '2522225', '7': '2522522', '8': '2552222', '9': '5225222',
            '-': '2225522', '$': '2255222', ':': '5222525', '/': '5252225', '.': '5252522',
            '+': '2252525', 'A': '2255252', 'B': '2525225', 'C': '2225255', 'D': '2225552'
        };
        // generate Codabar(NW-7) data:
        const codabar = symbol => {
            const r = {};
            let s = symbol.data.replace(/((?!^[A-D][0-9\-$:/.+]+[A-D]$).)*/i, '');
            if (s.length > 0) {
                // generate HRI
                r.hri = symbol.hri;
                r.text = s;
                // generate bars and spaces
                const q = symbol.quietZone ? 'a' : '0';
                const m = s.toUpperCase().split('').reduce((a, c) => a + nw7[c] + '2', q).slice(0, -1) + q;
                r.widths = m.split('').map(c => parseInt(c, 16) * symbol.width + 1 >> 1);
                const w = [ 25, 39, 50, 3, 5, 6 ];
                r.length = s.length * w[symbol.width - 2] - (s.match(/[\d\-$]/g) || []).length * w[symbol.width + 1] + symbol.width * (symbol.quietZone ? 19 : -1);
                r.height = symbol.height;
            }
            return r;
        };
        // Interleaved 2 of 5 patterns:
        const i25 = {
            element: '22552,52225,25225,55222,22525,52522,25522,22255,52252,25252'.split(','),
            start: '2222', stop: '522'
        };
        // generate Interleaved 2 of 5 data:
        const itf = symbol => {
            const r = {};
            let s = symbol.data.replace(/((?!^(\d{2})+$).)*/, '');
            if (s.length > 0) {
                // generate HRI
                r.hri = symbol.hri;
                r.text = s;
                // generate bars and spaces
                const d = symbol.data.replace(/((?!^(\d{2})+$).)*/, '', '').split('').map(c => Number(c));
                const q = symbol.quietZone ? 'a' : '0';
                let m = q + i25.start;
                let i = 0;
                while (i < d.length) {
                    const b = i25.element[d[i++]];
                    const s = i25.element[d[i++]];
                    m += b.split('').reduce((a, c, j) => a + c + s[j], '');
                }
                m += i25.stop + q;
                r.widths = m.split('').map(c => parseInt(c, 16) * symbol.width + 1 >> 1);
                const w = [ 16, 25, 32, 17, 26, 34 ];
                r.length = s.length * w[symbol.width - 2] + w[symbol.width + 1] + symbol.width * (symbol.quietZone ? 20 : 0);
                r.height = symbol.height;
            }
            return r;
        };
        // CODE39 patterns:
        const c39 = {
            '0': '222552522', '1': '522522225', '2': '225522225', '3': '525522222', '4': '222552225',
            '5': '522552222', '6': '225552222', '7': '222522525', '8': '522522522', '9': '225522522',
            'A': '522225225', 'B': '225225225', 'C': '525225222', 'D': '222255225', 'E': '522255222',
            'F': '225255222', 'G': '222225525', 'H': '522225522', 'I': '225225522', 'J': '222255522',
            'K': '522222255', 'L': '225222255', 'M': '525222252', 'N': '222252255', 'O': '522252252',
            'P': '225252252', 'Q': '222222555', 'R': '522222552', 'S': '225222552', 'T': '222252552',
            'U': '552222225', 'V': '255222225', 'W': '555222222', 'X': '252252225', 'Y': '552252222',
            'Z': '255252222', '-': '252222525', '.': '552222522', ' ': '255222522', '$': '252525222',
            '/': '252522252', '+': '252225252', '%': '222525252', '*': '252252522'
        };
        // generate CODE39 data:
        const code39 = symbol => {
            const r = {};
            let s = symbol.data.replace(/((?!^\*?[0-9A-Z\-. $/+%]+\*?$).)*/, '');
            if (s.length > 0) {
                // append start character and stop character
                s = s.replace(/^\*?([^*]+)\*?$/, '*$1*');
                // generate HRI
                r.hri = symbol.hri;
                r.text = s;
                // generate bars and spaces
                const q = symbol.quietZone ? 'a' : '0';
                const m = s.split('').reduce((a, c) => a + c39[c] + '2', q).slice(0, -1) + q;
                r.widths = m.split('').map(c => parseInt(c, 16) * symbol.width + 1 >> 1);
                const w = [ 29, 45, 58 ];
                r.length = s.length * w[symbol.width - 2] + symbol.width * (symbol.quietZone ? 19 : -1);
                r.height = symbol.height;
            }
            return r;
        };
        // UPC/EAN/JAN patterns:
        const ean = {
            a: '3211,2221,2122,1411,1132,1231,1114,1312,1213,3112'.split(','),
            b: '1123,1222,2212,1141,2311,1321,4111,2131,3121,2113'.split(','),
            c: '3211,2221,2122,1411,1132,1231,1114,1312,1213,3112'.split(','),
            g: '111,11111,111111,11,112'.split(','),
            p: 'aaaaaa,aababb,aabbab,aabbba,abaabb,abbaab,abbbaa,ababab,ababba,abbaba'.split(','),
            e: 'bbbaaa,bbabaa,bbaaba,bbaaab,babbaa,baabba,baaabb,bababa,babaab,baabab'.split(',')
        };
        // generate UPC-A data:
        const upca = symbol => {
            const s = Object.assign({}, symbol);
            s.data = '0' + symbol.data;
            const r = ean13(s);
            if ('text' in r) {
                r.text = r.text.slice(1);
            }
            return r;
        };
        // generate UPC-E data:
        const upce = symbol => {
            const r = {};
            const d = symbol.data.replace(/((?!^0\d{6,7}$).)*/, '').split('').map(c => Number(c));
            if (d.length > 0) {
                // calculate check digit
                d[7] = 0;
                d[7] = (10 - upcetoa(d).reduce((a, c, i) => a + c * (3 - (i % 2) * 2), 0) % 10) % 10;
                // generate HRI
                r.hri = symbol.hri;
                r.text = d.join('');
                // generate bars and spaces
                const q = symbol.quietZone ? '7' : '0';
                let m = q + ean.g[0];
                for (let i = 1; i < 7; i++) m += ean[ean.e[d[7]][i - 1]][d[i]];
                m += ean.g[2] + q;
                r.widths = m.split('').map(c => parseInt(c, 16) * symbol.width);
                r.length = symbol.width * (symbol.quietZone ? 65 : 51);
                r.height = symbol.height;
            }
            return r;
        };
        // convert UPC-E to UPC-A:
        const upcetoa = e => {
            const a = e.slice(0, 3);
            switch (e[6]) {
                case 0: case 1: case 2:
                    a.push(e[6], 0, 0, 0, 0, e[3], e[4], e[5]);
                    break;
                case 3:
                    a.push(e[3], 0, 0, 0, 0, 0, e[4], e[5]);
                    break;
                case 4:
                    a.push(e[3], e[4], 0, 0, 0, 0, 0, e[5]);
                    break;
                default:
                    a.push(e[3], e[4], e[5], 0, 0, 0, 0, e[6]);
                    break;
            }
            a.push(e[7]);
            return a;
        };
        // generate EAN-13(JAN-13) data:
        const ean13 = symbol => {
            const r = {};
            const d = symbol.data.replace(/((?!^\d{12,13}$).)*/, '').split('').map(c => Number(c));
            if (d.length > 0) {
                // calculate check digit
                d[12] = 0;
                d[12] = (10 - d.reduce((a, c, i) => a + c * ((i % 2) * 2 + 1)) % 10) % 10;
                // generate HRI
                r.hri = symbol.hri;
                r.text = d.join('');
                // generate bars and spaces
                let m = (symbol.quietZone ? 'b' : '0') + ean.g[0];
                for (let i = 1; i < 7; i++) m += ean[ean.p[d[0]][i - 1]][d[i]];
                m += ean.g[1];
                for (let i = 7; i < 13; i++) m += ean.c[d[i]];
                m += ean.g[0] + (symbol.quietZone ? '7' : '0');
                r.widths = m.split('').map(c => parseInt(c, 16) * symbol.width);
                r.length = symbol.width * (symbol.quietZone ? 113 : 95);
                r.height = symbol.height;
            }
            return r;
        };
        // generate EAN-8(JAN-8) data:
        const ean8 = symbol => {
            const r = {};
            const d = symbol.data.replace(/((?!^\d{7,8}$).)*/, '').split('').map(c => Number(c));
            if (d.length > 0) {
                // calculate check digit
                d[7] = 0;
                d[7] = (10 - d.reduce((a, c, i) => a + c * (3 - (i % 2) * 2), 0) % 10) % 10;
                // generate HRI
                r.hri = symbol.hri;
                r.text = d.join('');
                // generate bars and spaces
                const q = symbol.quietZone ? '7' : '0';
                let m = q + ean.g[0];
                for (let i = 0; i < 4; i++) m += ean.a[d[i]];
                m += ean.g[1];
                for (let i = 4; i < 8; i++) m += ean.c[d[i]];
                m += ean.g[0] + q;
                r.widths = m.split('').map(c => parseInt(c, 16) * symbol.width);
                r.length = symbol.width * (symbol.quietZone ? 81 : 67);
                r.height = symbol.height;
            }
            return r;
        };
        return {
            /**
             * Generate barcode.
             * @param {object} symbol barcode information (data, type, width, height, hri, quietZone)
             * @returns {object} barcode form
             */
            generate(symbol) {
                let r = {};
                switch (symbol.type) {
                    case 'upc':
                        r = symbol.data.length < 9 ? upce(symbol) : upca(symbol);
                        break;
                    case 'ean':
                    case 'jan':
                        r = symbol.data.length < 9 ? ean8(symbol) : ean13(symbol);
                        break;
                    case 'code39':
                        r = code39(symbol);
                        break;
                    case 'itf':
                        r = itf(symbol);
                        break;
                    case 'codabar':
                    case 'nw7':
                        r = codabar(symbol);
                        break;
                    case 'code93':
                        r = code93(symbol);
                        break;
                    case 'code128':
                        r = code128(symbol);
                        break;
                    default:
                        break;
                }
                return r;
            }
        };
    })();

    //
    // Command base object
    //
    const _base = {
        /**
         * Character width.
         * @type {number} character width (dots per character)
         */
        charWidth: 12,
        /**
         * Measure text width.
         * @param {string} text string to measure
         * @param {string} encoding codepage
         * @returns {number} string width
         */
        measureText(text, encoding) {
            let r = 0;
            const t = Array.from(text);
            switch (encoding) {
                case 'cp932':
                case 'shiftjis':
                    r = t.reduce((a, c) => {
                        const d = c.codePointAt(0);
                        return a + (d < 0x80 || d === 0xa5 || d === 0x203e || (d > 0xff60 && d < 0xffa0) ? 1 : 2);
                    }, 0);
                    break;
                case 'cp936':
                case 'gb18030':
                case 'cp949':
                case 'ksc5601':
                case 'cp950':
                case 'big5':
                    r = t.reduce((a, c) => a + (c.codePointAt(0) < 0x80 ? 1 : 2), 0);
                    break;
                case 'tis620':
                    const a = t.reduce((a, c) => {
                        const d = c.codePointAt(0);
                        if (a.consonant) {
                            if (d === 0xe31 || d >= 0xe34 && d <= 0xe3a || d === 0xe47) {
                                if (a.vowel) {
                                    a.length += 2;
                                    a.consonant = a.vowel = a.tone = false;
                                }
                                else {
                                    a.vowel = true;
                                }
                            }
                            else if (d >= 0xe48 && d <= 0xe4b) {
                                if (a.tone) {
                                    a.length += 2;
                                    a.consonant = a.vowel = a.tone = false;
                                }
                                else {
                                    a.tone = true;
                                }
                            }
                            else if (d === 0xe33 || d >= 0xe4c && d <= 0xe4e) {
                                if (a.vowel || a.tone) {
                                    a.length += 2;
                                    a.consonant = a.vowel = a.tone = false;
                                }
                                else {
                                    a.length += d === 0xe33 ? 2 : 1;
                                    a.consonant = false;
                                }
                            }
                            else if (d >= 0xe01 && d <= 0xe2e) {
                                a.length++;
                                a.vowel = a.tone = false;
                            }
                            else {
                                a.length += 2;
                                a.consonant = a.vowel = a.tone = false;
                            }
                        }
                        else if (d >= 0xe01 && d <= 0xe2e) {
                            a.consonant = true;
                        }
                        else {
                            a.length++;
                        }
                        return a;
                    }, { length: 0, consonant: false, vowel: false, tone: false });
                    if (a.consonant) {
                        a.length++;
                        a.consonant = a.vowel = a.tone = false;
                    }
                    r = a.length;
                    break;
                default:
                    r = t.length;
                    break;
            }
            return r;
        },
        /**
         * Create character array from string (supporting Thai combining characters).
         * @param {string} text string
         * @param {string} encoding codepage
         * @returns {string[]} array instance
         */
        arrayFrom(text, encoding) {
            const t = Array.from(text);
            if (encoding === 'tis620') {
                const a = t.reduce((a, c) => {
                    const d = c.codePointAt(0);
                    if (a.consonant) {
                        if (d === 0xe31 || d >= 0xe34 && d <= 0xe3a || d === 0xe47) {
                            if (a.vowel) {
                                a.result.push(a.consonant + a.vowel + a.tone, c);
                                a.consonant = a.vowel = a.tone = '';
                            }
                            else {
                                a.vowel = c;
                            }
                        }
                        else if (d >= 0xe48 && d <= 0xe4b) {
                            if (a.tone) {
                                a.result.push(a.consonant + a.vowel + a.tone, c);
                                a.consonant = a.vowel = a.tone = '';
                            }
                            else {
                                a.tone = c;
                            }
                        }
                        else if (d === 0xe33 || d >= 0xe4c && d <= 0xe4e) {
                            if (a.vowel || a.tone) {
                                a.result.push(a.consonant + a.vowel + a.tone, c);
                                a.consonant = a.vowel = a.tone = '';
                            }
                            else {
                                a.result.push(a.consonant + c);
                                a.consonant = '';
                            }
                        }
                        else if (d >= 0xe01 && d <= 0xe2e) {
                            a.result.push(a.consonant + a.vowel + a.tone);
                            a.consonant = c;
                            a.vowel = a.tone = '';
                        }
                        else {
                            a.result.push(a.consonant + a.vowel + a.tone, c);
                            a.consonant = a.vowel = a.tone = '';
                        }
                    }
                    else if (d >= 0xe01 && d <= 0xe2e) {
                        a.consonant = c;
                    }
                    else {
                        a.result.push(c);
                    }
                    return a;
                }, { result: [], consonant: '', vowel: '', tone: '' });
                if (a.consonant) {
                    a.result.push(a.consonant + a.vowel + a.tone);
                    a.consonant = a.vowel = a.tone = '';
                }
                return a.result;
            }
            else {
                return t;
            }
        },
        /**
         * Start printing.
         * @param {object} printer printer configuration
         * @returns {string} commands
         */
        open(printer) {
            return '';
        },
        /**
         * Finish printing.
         * @returns {string} commands
         */
        close() {
            return '';
        },
        /**
         * Set print area.
         * @param {number} left left margin (unit: characters)
         * @param {number} width print area (unit: characters)
         * @param {number} right right margin (unit: characters)
         * @returns {string} commands
         */
        area(left, width, right) {
            return '';
        },
        /**
         * Set line alignment.
         * @param {number} align line alignment (0: left, 1: center, 2: right)
         * @returns {string} commands
         */
        align(align) {
            return '';
        },
        /**
         * Set absolute print position.
         * @param {number} position absolute position (unit: characters)
         * @returns {string} commands
         */
        absolute(position) {
            return '';
        },
        /**
         * Set relative print position.
         * @param {number} position relative position (unit: characters)
         * @returns {string} commands
         */
        relative(position) {
            return '';
        },
        /**
         * Print horizontal rule.
         * @param {number} width line width (unit: characters)
         * @returns {string} commands
         */
        hr(width) {
            return '';
        },
        /**
         * Print vertical rules.
         * @param {number[]} widths vertical line spacing
         * @param {number} height text height (1-6)
         * @returns {string} commands
         */
        vr(widths, height) {
            return '';
        },
        /**
         * Start rules.
         * @param {number[]} widths vertical line spacing
         * @returns {string} commands
         */
        vrstart(widths) {
            return '';
        },
        /**
         * Stop rules.
         * @param {number[]} widths vertical line spacing
         * @returns {string} commands
         */
        vrstop(widths) {
            return '';
        },
        /**
         * Print vertical and horizontal rules.
         * @param {number[]} widths1 vertical line spacing (stop)
         * @param {number[]} widths2 vertical line spacing (start)
         * @param {number} dl difference in left position
         * @param {number} dr difference in right position
         * @returns {string} commands
         */
        vrhr(widths1, widths2, dl, dr) {
            return '';
        },
        /**
         * Set line spacing and feed new line.
         * @param {boolean} vr whether vertical ruled lines are printed
         * @returns {string} commands
         */
        vrlf(vr) {
            return '';
        },
        /**
         * Cut paper.
         * @returns {string} commands
         */
        cut() {
            return '';
        },
        /**
         * Underline text.
         * @returns {string} commands
         */
        ul() {
            return '';
        },
        /**
         * Emphasize text.
         * @returns {string} commands
         */
        em() {
            return '';
        },
        /**
         * Invert text.
         * @returns {string} commands
         */
        iv() {
            return '';
        },
        /**
         * Scale up text.
         * @param {number} wh number of special character '^' (1-7)
         * @returns {string} commands
         */
        wh(wh) {
            return '';
        },
        /**
         * Cancel text decoration.
         * @returns {string} commands
         */
        normal() {
            return '';
        },
        /**
         * Print text.
         * @param {string} text string to print
         * @param {string} encoding codepage
         * @returns {string} commands
         */
        text(text, encoding) {
            return '';
        },
        /**
         * Feed new line.
         * @returns {string} commands
         */
        lf() {
            return '';
        },
        /**
         * Insert commands.
         * @param {string} command commands to insert
         * @returns {string} commands
         */
        command(command) {
            return '';
        },
        /**
         * Print image.
         * @param {string} image image data (base64 png format)
         * @returns {string} commands
         */
        async image(image) {
            return '';
        },
        /**
         * Print QR Code.
         * @param {object} symbol QR Code information (data, type, cell, level)
         * @param {string} encoding codepage
         * @returns {string} commands
         */
        qrcode(symbol, encoding) {
            return '';
        },
        /**
         * Print barcode.
         * @param {object} symbol barcode information (data, type, width, height, hri)
         * @param {string} encoding codepage
         * @returns {string} commands
         */
        barcode(symbol, encoding) {
            return '';
        }
    };

    //
    // SVG
    //
    const _svg = {
        svgWidth: 576,
        svgHeight: 0,
        svgContent: '',
        lineMargin: 0,
        lineAlign: 0,
        lineWidth: 48,
        lineHeight: 1,
        textElement: '',
        textAttributes: {},
        textPosition: 0,
        textScale: 1,
        textEncoding: '',
        feedMinimum: 24,
        // printer configuration
        spacing: false,
        // start printing:
        open(printer) {
            this.svgWidth = printer.cpl * this.charWidth;
            this.svgHeight = 0;
            this.svgContent = '';
            this.lineMargin = 0;
            this.lineAlign = 0;
            this.lineWidth = printer.cpl;
            this.lineHeight = 1;
            this.textElement = '';
            this.textAttributes = {};
            this.textPosition = 0;
            this.textScale = 1;
            this.textEncoding = printer.encoding;
            this.feedMinimum = Number(this.charWidth * (printer.spacing ? 2.5 : 2));
            this.spacing = printer.spacing;
            return '';
        },
        // finish printing:
        close() {
            const p = { font: 'monospace', size: this.charWidth * 2, weight: 'normal', lang: '' };
            switch (this.textEncoding) {
                case 'cp932':
                case 'shiftjis':
                    p.font = `'MS Gothic', 'San Francisco', 'Osaka-Mono', monospace`;
                    p.lang = 'ja';
                    break;
                case 'cp936':
                case 'gb18030':
                    p.size -= 2;
                    p.lang = 'zh-Hans';
                    break;
                case 'cp949':
                case 'ksc5601':
                    p.size -= 2;
                    p.lang = 'ko';
                    break;
                case 'cp950':
                case 'big5':
                    p.size -= 2;
                    p.lang = 'zh-Hant';
                    break;
                case 'tis620':
                    p.font = `monospace`;
                    p.size -= 4;
                    p.lang = 'th';
                    break;
                default:
                    p.font = `'Courier New', 'Courier', monospace`;
                    p.size -= 2;
                    p.weight = 'bold';
                    break;
            }
            if (p.lang.length > 0) {
                p.lang = ` xml:lang="${p.lang}"`;
            }
            return `<svg width="${this.svgWidth}px" height="${this.svgHeight}px" viewBox="0 0 ${this.svgWidth} ${this.svgHeight}" preserveAspectRatio="xMinYMin meet" ` +
                `xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" version="1.1">` +
                `<defs><filter id="receiptinvert" x="0" y="0" width="100%" height="100%"><feFlood flood-color="#000"/><feComposite in="SourceGraphic" operator="xor"/></filter></defs>` +
                `<g font-family="${p.font}" fill="#000" font-size="${p.size}" font-weight="${p.weight}" dominant-baseline="text-after-edge" text-anchor="middle"${p.lang}>${this.svgContent}</g></svg>\n`;
        },
        // set print area:
        area(left, width, right) {
            this.lineMargin = left;
            this.lineWidth = width;
            return '';
        },
        // set line alignment:
        align(align) {
            this.lineAlign = align;
            return '';
        },
        // set absolute print position:
        absolute(position) {
            this.textPosition = position;
            return '';
        },
        // set relative print position:
        relative(position) {
            this.textPosition += position;
            return '';
        },
        // print horizontal rule:
        hr(width) {
            const w = this.charWidth;
            const path = `<path d="M0,${w}h${w * width}" fill="none" stroke="#000" stroke-width="2"/>`;
            this.svgContent += `<g transform="translate(${this.lineMargin * w},${this.svgHeight})">${path}</g>`;
            return '';
        },
        // print vertical rules:
        vr(widths, height) {
            const w = this.charWidth, u = w / 2, v = (w + w) * height;
            const path = `<path d="` + widths.reduce((a, width) => a + `m${w * width + w},${-v}v${v}`, `M${u},0v${v}`) + `" fill="none" stroke="#000" stroke-width="2"/>`;
            this.svgContent += `<g transform="translate(${this.lineMargin * w},${this.svgHeight})">${path}</g>`;
            return '';
        },
        // start rules:
        vrstart(widths) {
            const w = this.charWidth, u = w / 2;
            const path = `<path d="` + widths.reduce((a, width) => a + `h${w * width}h${u}v${w}m0,${-w}h${u}`, `M${u},${w + w}v${-u}q0,${-u},${u},${-u}`).replace(/h\d+v\d+m0,-\d+h\d+$/, `q${u},0,${u},${u}v${u}`) + `" fill="none" stroke="#000" stroke-width="2"/>`;
            this.svgContent += `<g transform="translate(${this.lineMargin * w},${this.svgHeight})">${path}</g>`;
            return '';
        },
        // stop rules:
        vrstop(widths) {
            const w = this.charWidth, u = w / 2;
            const path = `<path d="` + widths.reduce((a, width) => a + `h${w * width}h${u}v${-w}m0,${w}h${u}`, `M${u},0v${u}q0,${u},${u},${u}`).replace(/h\d+v-\d+m0,\d+h\d+$/, `q${u},0,${u},${-u}v${-u}`) + `" fill="none" stroke="#000" stroke-width="2"/>`;
            this.svgContent += `<g transform="translate(${this.lineMargin * w},${this.svgHeight})">${path}</g>`;
            return '';
        },
        // print vertical and horizontal rules:
        vrhr(widths1, widths2, dl, dr) {
            const w = this.charWidth, u = w / 2;
            const path1 = `<path d="` + widths1.reduce((a, width) => a + `h${w * width}h${u}v${-w}m0,${w}h${u}`, `M${u},0` + (dl > 0 ? `v${u}q0,${u},${u},${u}`: `v${w}h${u}`)).replace(/h\d+v-\d+m0,\d+h\d+$/, dr < 0 ? `q${u},0,${u},${-u}v${-u}` : `h${u}v${-w}`) + `" fill="none" stroke="#000" stroke-width="2"/>`;
            this.svgContent += `<g transform="translate(${(this.lineMargin + Math.max(-dl, 0)) * w},${this.svgHeight})">${path1}</g>`;
            const path2 = `<path d="` + widths2.reduce((a, width) => a + `h${w * width}h${u}v${w}m0,${-w}h${u}`, `M${u},${w + w}` + (dl < 0 ? `v${-u}q0,${-u},${u},${-u}`: `v${-w}h${u}`)).replace(/h\d+v\d+m0,-\d+h\d+$/, dr > 0 ? `q${u},0,${u},${u}v${u}` : `h${u}v${w}`) + `" fill="none" stroke="#000" stroke-width="2"/>`;
            this.svgContent += `<g transform="translate(${(this.lineMargin + Math.max(dl, 0)) * w},${this.svgHeight})">${path2}</g>`;
            return '';
        },
        // set line spacing and feed new line:
        vrlf(vr) {
            this.feedMinimum = Number(this.charWidth * (!vr && this.spacing ? 2.5 : 2));
            return this.lf();
        },
        // cut paper:
        cut() {
            const path = `<path d="M12,12.5l-7.5,-3a2,2,0,1,1,.5,0M12,11.5l-7.5,3a2,2,0,1,0,.5,0" fill="none" stroke="#000" stroke-width="1"/><path d="M12,12l10,-4q-1,-1,-2.5,-1l-10,4v2l10,4q1.5,0,2.5,-1z" fill="#000"/><path d="M24,12h${this.svgWidth - 24}" fill="none" stroke="#000" stroke-width="2" stroke-dasharray="2"/>`;
            this.svgContent += `<g transform="translate(0,${this.svgHeight})">${path}</g>`;
            return this.lf();
        },
        // underline text:
        ul() {
            this.textAttributes['text-decoration'] = 'underline';
            return '';
        },
        // emphasize text:
        em() {
            this.textAttributes.stroke = '#000';
            return '';
        },
        // invert text:
        iv() {
            this.textAttributes.filter = 'url(#receiptinvert)';
            return '';
        },
        // scale up text:
        wh(wh) {
            const w = wh < 2 ? wh + 1 : wh - 1;
            const h = wh < 3 ? wh : wh - 1;
            this.textAttributes.transform = `scale(${w},${h})`;
            this.lineHeight = Math.max(this.lineHeight, h);
            this.textScale = w;
            return '';
        },
        // cancel text decoration:
        normal() {
            this.textAttributes = {};
            this.textScale = 1;
            return '';
        },
        // print text:
        text(text, encoding) {
            let p = this.textPosition;
            const tspan = this.arrayFrom(text, encoding).reduce((a, c) => {
                const q = this.measureText(c, encoding) * this.textScale;
                const r = (p + q / 2) * this.charWidth / this.textScale;
                p += q;
                return a + `<tspan x="${r}">${c.replace(/[ &<>]/g, r => ({' ': '&#xa0;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}[r]))}</tspan>`;
            }, '');
            const attr = Object.keys(this.textAttributes).reduce((a, key) => a + ` ${key}="${this.textAttributes[key]}"`, '');
            this.textElement += `<text${attr}>${tspan}</text>`;
            this.textPosition += this.measureText(text, encoding) * this.textScale;
            return '';
        },
        // feed new line:
        lf() {
            const h = this.lineHeight * this.charWidth * 2;
            if (this.textElement.length > 0) {
                this.svgContent += `<g transform="translate(${this.lineMargin * this.charWidth},${this.svgHeight + h})">${this.textElement}</g>`;
            }
            this.svgHeight += Math.max(h, this.feedMinimum);
            this.lineHeight = 1;
            this.textElement = '';
            this.textPosition = 0;
            return '';
        },
        // insert commands:
        command(command) {
            return '';
        },
        // print image:
        image(image) {
            const png = typeof window !== 'undefined' ? window.atob(image) : Buffer.from(image, 'base64').toString('binary');
            let imgWidth = 0;
            let imgHeight = 0;
            png.replace(/^\x89PNG\x0d\x0a\x1a\x0a\x00\x00\x00\x0dIHDR(.{4})(.{4})/, (match, w, h) => {
                imgWidth = w.charCodeAt(0) << 24 | w.charCodeAt(1) << 16 | w.charCodeAt(2) << 8 | w.charCodeAt(3);
                imgHeight = h.charCodeAt(0) << 24 | h.charCodeAt(1) << 16 | h.charCodeAt(2) << 8 | h.charCodeAt(3);
                return '';
            });
            const imgData = `<image xlink:href="data:image/png;base64,${image}" x="0" y="0" width="${imgWidth}" height="${imgHeight}"/>`;
            const margin = this.lineMargin * this.charWidth + (this.lineWidth * this.charWidth - imgWidth) * this.lineAlign / 2;
            this.svgContent += `<g transform="translate(${margin},${this.svgHeight})">${imgData}</g>`;
            this.svgHeight += imgHeight;
            return '';
        },
        // print QR Code:
        qrcode(symbol, encoding) {
            if (typeof qrcode !== 'undefined' && symbol.data.length > 0) {
                const qr = qrcode(0, symbol.level.toUpperCase());
                qr.addData(symbol.data);
                qr.make();
                qr.createSvgTag(symbol.cell, 0).replace(/width="(\d+)px".*height="(\d+)px".*(<path.*?>)/, (match, w, h, path) => {
                    const margin = this.lineMargin * this.charWidth + (this.lineWidth * this.charWidth - Number(w)) * this.lineAlign / 2;
                    this.svgContent += `<g transform="translate(${margin},${this.svgHeight})">${path}</g>`;
                    this.svgHeight += Number(h);
                });
            }
            return '';
        },
        // print barcode:
        barcode(symbol, encoding) {
            const bar = barcode.generate(symbol);
            const h = bar.height;
            if ('length' in bar) {
                const width = bar.length;
                const height = h + (bar.hri ? this.charWidth * 2 + 2 : 0);
                // draw barcode
                let path = `<path d="`;
                bar.widths.reduce((p, w, i) => {
                    if (i % 2 === 1) {
                        path += `M${p},${0}h${w}v${h}h${-w}z`;
                    }
                    return p + w;
                }, 0);
                path += '" fill="#000"/>';
                // draw human readable interpretation
                if (bar.hri) {
                    const m = (width - (bar.text.length - 1) * this.charWidth) / 2;
                    const tspan = bar.text.split('').reduce((a, c, i) => a + `<tspan x="${m + this.charWidth * i}">${c.replace(/[ &<>]/g, r => ({' ': '&#xa0;', '&': '&amp;', '<': '&lt;', '>': '&gt;'}[r]))}</tspan>`, '');
                    path += `<text y="${height}">${tspan}</text>`;
                }
                const margin = this.lineMargin * this.charWidth + (this.lineWidth * this.charWidth - width) * this.lineAlign / 2;
                this.svgContent += `<g transform="translate(${margin},${this.svgHeight})">${path}</g>`;
                this.svgHeight += height;
            }
            return '';
        }
    };

    //
    // Plain Text
    //
    const _text = {
        left: 0,
        width: 48,
        position: 0,
        scale: 1,
        buffer: [],
        // start printing:
        open(printer) {
            this.left = 0;
            this.width = printer.cpl;
            this.position = 0;
            this.scale = 1;
            this.buffer = [];
            return '';
        },
        // set print area:
        area(left, width, right) {
            this.left = left;
            this.width = width;
            return '';
        },
        // set absolute print position:
        absolute(position) {
            this.position = position;
            return '';
        },
        // set relative print position:
        relative(position) {
            this.position += Math.round(position);
            return '';
        },
        // print horizontal rule:
        hr(width) {
            return ' '.repeat(this.left) + '-'.repeat(width);
        },
        // print vertical rules:
        vr(widths, height) {
            this.buffer.push({ data: '|', index: this.position, length: 1 });
            widths.forEach(w => {
                this.position += w + 1;
                this.buffer.push({ data: '|', index: this.position, length: 1 });
            });
            return '';
        },
        // start rules:
        vrstart(widths) {
            return ' '.repeat(this.left) + widths.reduce((a, w) => a + '-'.repeat(w) + '+', '+');
        },
        // stop rules:
        vrstop(widths) {
            return ' '.repeat(this.left) + widths.reduce((a, w) => a + '-'.repeat(w) + '+', '+');
        },
        // print vertical and horizontal rules:
        vrhr(widths1, widths2, dl, dr) {
            const r1 = ' '.repeat(Math.max(-dl, 0)) + widths1.reduce((a, w) => a + '-'.repeat(w) + '+', '+') + ' '.repeat(Math.max(dr, 0));
            const r2 = ' '.repeat(Math.max(dl, 0)) + widths2.reduce((a, w) => a + '-'.repeat(w) + '+', '+') + ' '.repeat(Math.max(-dr, 0));
            return ' '.repeat(this.left) + r2.split('').reduce((a, c, i) => a + this.vrtable[c][r1[i]], '');
        },
        // ruled line composition
        vrtable: {
            ' ' : { ' ' : ' ', '+' : '+', '-' : '-' },
            '+' : { ' ' : '+', '+' : '+', '-' : '+' },
            '-' : { ' ' : '-', '+' : '+', '-' : '-' }
        },
        // set line spacing and feed new line:
        vrlf(vr) {
            return this.lf();
        },
        // scale up text:
        wh(wh) {
            const w = wh < 2 ? wh + 1 : wh - 1;
            this.scale = w;
            return '';
        },
        // cancel text decoration:
        normal() {
            this.scale = 1;
            return '';
        },
        // print text:
        text(text, encoding) {
            const d = this.arrayFrom(text, encoding).reduce((a, c) => a + c + ' '.repeat(this.measureText(c, encoding) * (this.scale - 1)), '');
            const l = this.measureText(text, encoding) * this.scale;
            this.buffer.push({ data: d, index: this.position, length: l });
            this.position += l;
            return '';
        },
        // feed new line:
        lf() {
            let r = '';
            if (this.buffer.length > 0) {
                let p = 0;
                r += this.buffer.sort((a, b) => a.index - b.index).reduce((a, c) => {
                    const s = a + ' '.repeat(c.index - p) + c.data;
                    p = c.index + c.length;
                    return s;
                }, ' '.repeat(this.left));
            }
            r += '\n';
            this.position = 0;
            this.buffer = [];
            return r;
        }
    };

    const Base64PNG = {
        async from(svg, options = {}) {
            const c = commands.svg.charWidth;
            const m = options.margin * c || 0;
            const n = options.marginRight * c || 0;
            const img = new Image();
            img.src = 'data:image/svg+xml,' + encodeURIComponent(svg);
            await img.decode();
            const w = img.width;
            const h = img.height;
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            if (options.landscape) {
                canvas.width = h;
                canvas.height = w + m + n;
                context.translate(0, w + n);
                context.rotate(-Math.PI / 2);
            }
            else {
                canvas.width = w;
                canvas.height = h;
            }
            context.drawImage(img, 0, 0);
            return canvas.toDataURL('png');
        }
    };

    const commands = {
        base: { ..._base },
        svg: { ..._base, ..._svg },
        text: { ..._base, ..._text }
    };

    const encoding = {
        'ja': 'shiftjis', 'ko': 'ksc5601', 'zh': 'gb18030', 'zh-hans': 'gb18030', 'zh-hant': 'big5', 'th': 'tis620'
    };

    const parseOption = options => {
        // parameters
        const params = {
            p: '', // printer control language
            c: '-1', // characters per line
            u: false, // upside down
            v: false, // landscape orientation
            r: '-1', // print resolution for -v
            s: false, // paper saving
            n: false, // no paper cut
            m: '-1,-1', // print margin
            i: false, // print as image
            b: '-1', // image thresholding
            g: '-1', // image gamma correction
            l: new Intl.NumberFormat().resolvedOptions().locale // language of source file
        };
        // arguments
        const argv = options ? options.split(' ') : [];
        // parse arguments
        for (let i = 0; i < argv.length; i++) {
            const key = argv[i];
            if (/^-[uvsni]$/.test(key)) {
                // option without value
                params[key[1]] = true;
            }
            else if (/^-[pcrmbgl]$/.test(key)) {
                // option with value
                if (i < argv.length - 1) {
                    const value = argv[i + 1];
                    if (/^[^-]/.test(value)) {
                        params[key[1]] = value;
                        i++;
                    }
                }
            }
            else {
                // undefined option
            }
        }
        // language
        let l = params.l.toLowerCase();
        l = l.slice(0, /^zh-han[st]/.test(l) ? 7 : 2);
        // printer control language
        let p = params.p.toLowerCase();
        if (!/^(escpos|epson|sii|citizen|fit|impactb?|generic|star(line|graphic|impact[23]?)?|emustarline)$/.test(p)) {
            p = 'base';
        }
        else if (/^(emu)?star(line)?$/.test(p)) {
            p += `${/^(ja|ko|zh)/.test(l) ? 'm' : 's'}bcs${/^(ko|zh)/.test(l) ? '2' : ''}`;
        }
        // string to number
        const c = Number(params.c);
        const m = params.m.split(',').map(c => Number(c));
        const r = Number(params.r);
        const b = Number(params.b);
        const g = Number(params.g);
        // options
        return {
            asImage: params.i,
            landscape: params.v,
            resolution: r === 180 ? r : 203,
            cpl: c >= 24 && c <= 96 ? Math.trunc(c) : 48,
            encoding: encoding[l] || 'multilingual',
            gradient: !(b >= 0 && b <= 255),
            gamma: g >= 0.1 && g <= 10.0 ? g : 1.0,
            threshold: b >= 0 && b <= 255 ? Math.trunc(b) : 128,
            upsideDown: params.u,
            spacing: !params.s,
            cutting: !params.n,
            margin: m[0] >= 0 && m[0] <= 24 ? Math.trunc(m[0]) : 0,
            marginRight: m[1] >= 0 && m[1] <= 24 ? Math.trunc(m[1]) : 0,
            command: p
        };
    };

    return {
        /**
         * Barcode generator.
         * @type {object} barcode generator
         */
        barcode: barcode,
        /**
         * Command objects.
         * @type {object} command objects
         */
        commands: commands,
        /**
         * Create instance.
         * @param {string} markdown receipt markdown
         * @param {string} [options] conversion options
         * @returns {object} new instance
         */
        from(markdown, options) {
            // parse options
            const params = parseOption(options);
            // create instance
            return {
                /**
                 * Return string representing this object.
                 * @returns {string} receipt markdown
                 */
                toString() {
                    return markdown;
                },
                /**
                 * Convert receipt markdown to text.
                 * @returns {string} text
                 */
                async toText() {
                    return await transform(markdown, { ...params, ...{ command: commands.text } });
                },
                /**
                 * Convert receipt markdown to SVG.
                 * @returns {string} SVG
                 */
                async toSVG() {
                    return await transform(markdown, { ...params, ...{ command: commands.svg } });
                },
                /**
                 * Convert receipt markdown to PNG.
                 * @returns {string} PNG as data URL
                 */
                async toPNG() {
                    return await Base64PNG.from(await this.toSVG());
                },
                /**
                 * Convert receipt markdown to printer commands.
                 * @returns {string} printer commands
                 */
                async toCommand() {
                    // printer control language
                    let p = params.command;
                    // print as image
                    if (params.asImage) {
                        const r90 = params.landscape ? { cpl: 48, margin: 0, marginRight: 0 } : {};
                        const png = await Base64PNG.from(await this.toSVG(), params);
                        return await transform(`|{i:${png.replace(/^data:.*,/, '')}}`, { ...params, ...r90, ...{ command: ReceiptPrinter.create(p) } });
                    }
                    // print with device font
                    if (params.landscape && /^(escpos|epson|sii|citizen|star[sm]bcs2?)$/.test(p)) {
                        p += '90';
                    }
                    // convert markdown to command
                    return await transform(markdown, { ...params, ...{ command: ReceiptPrinter.create(p) } });
                }
            };
        }
    };
})();