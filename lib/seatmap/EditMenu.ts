import CollisionManager from "./CollisionManager";
import { CELL_STYLE_KEYS, EDITMENU_LABELS } from "./data";
import { CellState, CellStyleOverride, CellStyleOverridePure, CellType, Collision, EditMenuElement, EditMenuState } from "./types";
import { FPSCounter } from "./util";
import Map from "./Map";

export default class EditMenu {
    map: Map;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    input: HTMLInputElement;

    collisions: CollisionManager<string>;

    fpsCounter: FPSCounter = new FPSCounter();

    /**
     * State must always be stringifyable.
     */
    state: EditMenuState = {
        input: {
            property: null,
            value: ""
        },
        animations: {
            blinkingCursor: {
                lastTick: 0,
                lastState: "hidden",
                interval: 500 as const
            }
        },
        selectedStyleState: "default",
        selectedType: "seat",
        selectedInput: -1,
        cellStyleChanges: {},
        selectedCells: null
    }

    lastFrameState: EditMenuState = JSON.parse(JSON.stringify(this.state));

    elements: EditMenuElement[] = [];

    constructor(map: Map, editMenuId: string) {
        this.map = map;

        const canvas = document.querySelector(`#${editMenuId} > canvas`);
        if (canvas === null) {
            throw new Error(`Canvas element for ID ${editMenuId} not found.`);
        }

        this.canvas = canvas as HTMLCanvasElement;

        this.collisions = new CollisionManager(this);

        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.ctx = this.canvas.getContext("2d") as CanvasRenderingContext2D;

        let input = document.querySelector(`#${editMenuId} > input`);
        if (input === null) {
            throw new Error(`Input element for ID ${editMenuId} not found.`);
        }

        this.input = input as HTMLInputElement;

        this.input.addEventListener("input", event => this.handleInputChange(event));

        this.canvas.onkeydown = (event) => {
            if (event.key === "Escape") {
                if (!this.state.selectedCells) {
                    return;
                }

                this.map.unselectCells();
            }
        }

        this.input.onkeydown = (event) => {
            if (event.key === "Enter") {
                if (this.state.selectedInput > -1) {
                    this.applyToMap();
                }
            }

            if (event.key === "Escape") {
                this.input.blur();
                this.unselectInput();
            }

            if (event.key === "Tab") {
                event.preventDefault();

                let nextInputIndex = 0;

                for (let i = this.state.selectedInput + 1; i < this.elements.length; i++) {
                    if (this.elements[i].type === "input") {
                        nextInputIndex = i;
                        break;
                    }
                }

                if (nextInputIndex === 0) {
                    for (let i = 0; i < this.elements.length; i++) {
                        if (this.elements[i].type === "input") {
                            nextInputIndex = i;
                            break;
                        }
                    }
                }

                this.selectInput(nextInputIndex);
            }
        }

        this.input.onblur = () => {
            this.unselectInput();
        }

        this.collisions.addEventListener("click", (collision: Collision<string>) => this.handleClickCollisions(collision));

        setInterval(() => this.runAnimations(), 50);

        this.unSelectCell();

        this.render();
    }

    selectInput(input: number) {
        const element = this.elements[input];

        if (element && element.type === "input") {
            this.state.input.property = element.label as keyof CellStyleOverridePure;
            this.state.input.value = this.cellStyleChangesByKey(element.value as keyof CellStyleOverridePure);
            this.input.value = this.state.input.value;
            this.input.focus();
            this.state.selectedInput = input;
            this.state.animations.blinkingCursor.lastTick = Date.now();
            this.state.animations.blinkingCursor.lastState = "visible";
        }
    }

    unselectInput() {
        this.state.selectedInput = -1;
        this.state.input.property = null;
        this.state.input.value = "";
        this.input.value = "";

        this.renderIfStateChanged();
    }

    runAnimations() {
        if (this.state.selectedInput > -1) {
            if (Date.now() - this.state.animations.blinkingCursor.interval > this.state.animations.blinkingCursor.lastTick) {
                this.state.animations.blinkingCursor.lastTick = Date.now();

                if (this.state.animations.blinkingCursor.lastState === "visible") {
                    this.state.animations.blinkingCursor.lastState = "hidden";
                } else {
                    this.state.animations.blinkingCursor.lastState = "visible";
                }
            }
        }

        this.renderIfStateChanged();
    }

    cellStyleChangesByKey(key: keyof CellStyleOverridePure): string {
        if (this.state.selectedStyleState === "default") {
            return this.state.cellStyleChanges[key]?.toString() || ""
        } else if (this.state.selectedStyleState === "hover") {
            if (this.state.cellStyleChanges.hoverOverride) {
                return this.state.cellStyleChanges.hoverOverride[key]?.toString() || "";
            }
        } else if (this.state.selectedStyleState === "selected") {
            if (this.state.cellStyleChanges.selectedOverride) {
                return this.state.cellStyleChanges.selectedOverride[key]?.toString() || "";
            }
        }

        return "";
    }

    handleClickCollisions(collision: Collision<string>) {
        if (collision.reference === -1) {
            return;
        }
        if (parseInt(collision.reference).toString() === collision.reference) {
            // Simple reference
            const elementIndex = parseInt(collision.reference);
            if (elementIndex < 0 || elementIndex >= this.elements.length) {
                return;
            }

            const element = this.elements[elementIndex];

            if (element.type === "input") {
                this.selectInput(parseInt(collision.reference))
            } else if (element.type === "button") {
                element.action();
            }

            return;
        }

        if (collision.reference.endsWith("-") || collision.reference.endsWith("+")) {
            // HSelect arrow click
            const match = collision.reference.match(/(\d+)([+-])/);

            const baseIndex = match?.[1];
            const direction = match?.[2];

            if (!baseIndex || !direction) {
                console.error(`Invalid collision reference: ${collision.reference}`);
                return;
            }

            const index = parseInt(baseIndex);

            if (index < 0 || index >= this.elements.length) {
                return;
            }

            const element = this.elements[index];

            if (element.type === "hselect") {
                if (element.label === "hslct_edit_state") {
                    let selectedIndex = element.options.indexOf(this.state.selectedStyleState);

                    if (direction === "-") {
                        if (selectedIndex > 0) {
                            selectedIndex--;
                        }
                    } else if (direction === "+") {
                        if (selectedIndex < element.options.length - 1) {
                            selectedIndex++;
                        }
                    }

                    this.state.selectedStyleState = element.options[selectedIndex] as CellState;

                    this.state.selectedInput = -1; // Unselect input when changing state
                } else if (element.label === "hslct_type") {
                    let selectedIndex = element.options.indexOf(this.state.selectedType);

                    if (direction === "-") {
                        if (selectedIndex > 0) {
                            selectedIndex--;
                        }
                    } else if (direction === "+") {
                        if (selectedIndex < element.options.length - 1) {
                            selectedIndex++;
                        }
                    }

                    this.state.selectedType = element.options[selectedIndex] as CellType;
                }

                this.renderIfStateChanged();
            }

            return;
        }
    }

    handleInputChange(event: Event) {
        if (!this.state.selectedCells || this.state.selectedInput < 0 || this.state.selectedInput >= this.elements.length) {
            return;
        }

        this.state.input.value = (event.target as HTMLInputElement).value;

        if (this.state.input.property) {
            const element = this.elements[this.state.selectedInput];

            if (element && element.type === "input") {
                if (this.state.selectedStyleState === "default") {
                    // @ts-ignore
                    this.state.cellStyleChanges[this.state.input.property as keyof CellStyleOverride] = this.state.input.value;
                }

                if (this.state.selectedStyleState === "hover") {
                    if (this.state.cellStyleChanges.hoverOverride === undefined) {
                        this.state.cellStyleChanges.hoverOverride = {};
                    }

                    //@ts-ignore
                    this.state.cellStyleChanges.hoverOverride[this.state.input.property] = this.state.input.value;
                }

                if (this.state.selectedStyleState === "selected") {
                    if (this.state.cellStyleChanges.selectedOverride === undefined) {
                        this.state.cellStyleChanges.selectedOverride = {};
                    }

                    //@ts-ignore
                    this.state.cellStyleChanges.selectedOverride[this.state.input.property] = this.state.input.value;
                }
            }
        }

        this.render();
    }

    unSelectCell() {
        this.input.blur();
        
        this.elements = [];

        this.elements.push({
            type: "label",
            label: "default_text1"
        }, {
            type: "button",
            label: "btn_export",
            action: () => {
                let a = document.createElement("a");
                let file = new Blob([JSON.stringify(this.map.exportMapLayout())], { type: "JSON" });
                a.href = URL.createObjectURL(file);
                a.download = "test.json";
                a.click();
            }
        }, {
            type: "button",
            label: "btn_save",
            action: () => {
                this.map.emit("save", this.map.exportMapLayout());
            }
        }, {
            type: "button",
            label: "btn_toggle_preview",
            action: () => {
                this.map.togglePreview();
            }
        })

        this.state.selectedInput = -1;
        this.state.input.property = null;
        this.state.input.value = "";
        this.input.value = "";
        this.state.cellStyleChanges = {};
        this.state.selectedCells = null;
        this.state.selectedStyleState = "default";
        this.state.selectedType = "seat";

        this.render();
    }

    selectCells(cellIndexes: number[]) {
        if (cellIndexes.length === 0) {
            this.unSelectCell();

            return;
        }

        for (let i = 0; i < cellIndexes.length; i++) {
            const cell2 = this.map.mapLayout.cells[cellIndexes[i]];
            if (!cell2) {
                console.error(`No cell found at index: ${cellIndexes[i]}`);

                return;
            }
        }

        const elements: EditMenuElement[] = [];

        elements.push({
            type: "hselect",
            label: "hslct_type",
            options: [
                "seat",
                "aisle",
                "wall",
                "door",
                "custom"
            ]
        });

        elements.push({
            type: "hselect",
            label: "hslct_edit_state",
            options: [
                "default",
                "hover",
                "selected"
            ]
        });

        for (const key of CELL_STYLE_KEYS) {
            elements.push({
                type: "input",
                label: key,
                value: key as keyof CellStyleOverridePure
            });
        }

        elements.push({
            type: "button",
            label: "btn_apply",
            action: () => this.applyToMap()
        })

        this.elements = elements;

        const cell = this.map.mapLayout.cells[cellIndexes[0]];

        this.state.selectedCells = {
            indexes: cellIndexes,
            editState: "default",
            type: cell?.type || null
        }

        this.state.cellStyleChanges = { ...(cell || {}).styleOverride };
        this.state.selectedType = cell?.type || "seat";

        this.render();
    }

    applyToMap() {
        if (!this.map || !this.state.selectedCells) return;

        const cellIndexes = this.state.selectedCells.indexes;

        for (let cellIndex of cellIndexes) {
            if (cellIndex < 0 || cellIndex >= this.map.mapLayout.cells.length) {
                console.error(`Invalid cell index: ${cellIndex}`);
                return;
            }

            let cell = this.map.mapLayout.cells[cellIndex];

            if (cell === null) {
                cell = {
                    name: cellIndex.toString(),
                    type: this.state.selectedType,
                    styleOverride: {}
                };

                this.map.mapLayout.cells[cellIndex] = cell;
            }

            if (!cell) {
                console.error(`No cell found at index: ${cellIndex}`);
                return;
            }

            if (!cell.styleOverride) {
                cell.styleOverride = {};
            }

            if (this.state.cellStyleChanges.hoverOverride) {
                cell.styleOverride.hoverOverride = { ...this.state.cellStyleChanges.hoverOverride };
            }

            if (this.state.cellStyleChanges.selectedOverride) {
                cell.styleOverride.selectedOverride = { ...this.state.cellStyleChanges.selectedOverride };
            }

            // Apply the style changes to the cell
            Object.assign(cell.styleOverride, this.state.cellStyleChanges);

            for (const key in cell.styleOverride) {
                if (cell.styleOverride[key as keyof CellStyleOverridePure] === "") {
                    delete cell.styleOverride[key as keyof CellStyleOverridePure];
                }
            }
            for (const key in cell.styleOverride.hoverOverride) {
                if (cell.styleOverride.hoverOverride[key as keyof CellStyleOverridePure] === "") {
                    delete cell.styleOverride.hoverOverride[key as keyof CellStyleOverridePure];
                }
            }
            for (const key in cell.styleOverride.selectedOverride) {
                if (cell.styleOverride.selectedOverride[key as keyof CellStyleOverridePure] === "") {
                    delete cell.styleOverride.selectedOverride[key as keyof CellStyleOverridePure];
                }
            }

            cell.type = this.state.selectedType;
        }

        this.map.render();
    }

    renderIfStateChanged() {
        if (!this.ctx || !this.canvas || !this.input) return;

        if (JSON.stringify(this.state) === JSON.stringify(this.lastFrameState)) {
            return;
        }

        this.render();
    }

    render() {
        if (!this.ctx || !this.canvas || !this.input) return;

        this.fpsCounter.tick();
        this.lastFrameState = JSON.parse(JSON.stringify(this.state));

        const collisions: Collision<string>[] = [];

        const paddingX = 10;
        const marginY = 30;

        const inputHeight = 30;
        const inputWidth = this.canvas.width - (paddingX * 2);
        const inputPadding = 5;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.fillStyle = "#0F0";
        const fpsTextMeasurements = this.ctx.measureText(this.fpsCounter.frameCount.toString());
        const fpsTextWidth = fpsTextMeasurements.width;
        this.ctx.fillText(this.fpsCounter.frameCount.toString(), this.canvas.width - fpsTextWidth - 10, 20);

        this.ctx.fillStyle = "#FFF";
        this.ctx.font = `20px Arial`;
        this.ctx.fillText("Edit Menu", paddingX, 30);

        let lastElementYEnd = 60;

        for (let i = 0; i < this.elements.length; i++) {
            const element = this.elements[i];

            const label = EDITMENU_LABELS[element.label];

            if (element.type === "label") {
                this.ctx.fillStyle = "#FFF";
                this.ctx.font = `16px Arial`;
                this.ctx.fillText(label, paddingX, lastElementYEnd);

                const textMeasurements = this.ctx.measureText(label);

                lastElementYEnd += textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent + marginY;
            } else if (element.type === "input") {
                this.ctx.fillStyle = "#FFF";
                this.ctx.font = `16px Arial`;
                this.ctx.fillText(label, paddingX, lastElementYEnd);

                const textMeasurements = this.ctx.measureText(label);

                lastElementYEnd += textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent;

                this.ctx.fillRect(paddingX, lastElementYEnd, inputWidth, inputHeight);

                let cursorMarginX = paddingX + inputPadding;

                let value: string = this.cellStyleChangesByKey(element.value as keyof CellStyleOverridePure);

                if (value && value.length > 0) {
                    this.ctx.fillStyle = "#000";
                    this.ctx.font = `16px Arial`;
                    const textMeasurements = this.ctx.measureText(value);
                    const textHeight = textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent;

                    this.ctx.fillText(value, cursorMarginX, lastElementYEnd + (inputHeight / 2) + (textHeight / 2));

                    cursorMarginX += textMeasurements.width;
                }

                if (this.state.selectedInput === i && this.state.animations.blinkingCursor.lastState === "visible") {
                    this.ctx.fillStyle = "#000";
                    this.ctx.beginPath();
                    this.ctx.moveTo(cursorMarginX, lastElementYEnd + inputPadding);
                    this.ctx.lineTo(cursorMarginX, lastElementYEnd + inputHeight - inputPadding);
                    this.ctx.stroke();
                }

                collisions.push({
                    x: paddingX,
                    y: lastElementYEnd,
                    width: inputWidth,
                    height: inputHeight,
                    reference: i.toString()
                })

                lastElementYEnd += 30 + marginY;
            } else if (element.type === "button") {
                // Button rendering logic here
                this.ctx.font = `16px Arial`;

                const textWidth = this.ctx.measureText(label).width;
                const buttonWidth = textWidth + (paddingX * 2);

                this.ctx.fillStyle = "#00F";
                this.ctx.fillRect(paddingX, lastElementYEnd, buttonWidth, inputHeight);

                this.ctx.fillStyle = "#FFF";
                this.ctx.fillText(label, paddingX + paddingX, lastElementYEnd + (inputHeight / 2) + 5);

                collisions.push({
                    x: paddingX,
                    y: lastElementYEnd,
                    width: buttonWidth,
                    height: inputHeight,
                    reference: i.toString()
                });

                lastElementYEnd += inputHeight + marginY;
            } else if (element.type === "hselect") {
                let labelTag = "";

                if (element.label === "hslct_edit_state") {
                    labelTag = this.state.selectedStyleState;
                } else if (element.label === "hslct_type") {
                    labelTag = this.state.selectedType;
                }

                this.ctx.fillStyle = "#F00";
                this.ctx.fillRect(paddingX, lastElementYEnd, inputWidth, inputHeight);
                this.ctx.fillStyle = "#FFF";
                this.ctx.font = `20px Arial Bold`;

                const optionLabel = EDITMENU_LABELS[labelTag] || labelTag;

                const textWidth = this.ctx.measureText(optionLabel).width;
                const arrowWidth = this.ctx.measureText("→").width;

                this.ctx.fillText("←", paddingX + 5, lastElementYEnd + (inputHeight / 2) + 5);
                this.ctx.fillText("→", paddingX + inputWidth - 5 - arrowWidth, lastElementYEnd + (inputHeight / 2) + 5);

                this.ctx.fillText(optionLabel, paddingX + ((inputWidth / 2) - (textWidth / 2)), lastElementYEnd + (inputHeight / 2) + 5);

                collisions.push({
                    x: paddingX + 5,
                    y: lastElementYEnd,
                    width: arrowWidth,
                    height: inputHeight,
                    reference: `${i}-`
                });

                collisions.push({
                    x: paddingX + inputWidth - 5 - arrowWidth,
                    y: lastElementYEnd,
                    width: arrowWidth,
                    height: inputHeight,
                    reference: `${i}+`
                });

                lastElementYEnd += inputHeight + marginY;
            }
        }

        this.collisions.registerCollisions(collisions);
    }
}