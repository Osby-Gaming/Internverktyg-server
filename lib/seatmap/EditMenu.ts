import CollisionManager from "./CollisionManager";
import { CELL_STYLE_KEYS, EDITMENU_LABELS } from "./data";
import { CellStyleOverride, CellStyleOverridePure, Collision, EditMenuElement, EditMenuState } from "./types";
import { FPSCounter } from "./util";
import Map from "./Map";

export default class EditMenu {
    map: Map;

    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    input: HTMLInputElement;

    collisions: CollisionManager;

    fpsCounter: FPSCounter = new FPSCounter();

    controller: {
        mouseX: number;
        mouseY: number;
        mouseDown: boolean;
    } = {
            mouseX: 0,
            mouseY: 0,
            mouseDown: false
        }

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
        selectedInput: -1,
        cellStyleChanges: {},
        selectedCell: null
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
                if (!this.state.selectedCell) {
                    return;
                }

                this.unSelectCell();
                this.input.blur();

                this.map.state.selectedCell = -1;
                this.map.render();
            }
        }

        this.input.onkeydown = (event) => {
            if (event.key === "Enter") {
                if (this.state.selectedInput > -1) {
                    this.applyToMap();
                }
            }
        }

        this.collisions.addEventListener("click", (collision) => this.handleClickCollisions(collision));

        setInterval(() => this.runAnimations(), 50);

        this.unSelectCell();

        this.render();
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

    handleClickCollisions(collision: Collision) {
        if (collision.cellIndex < 0 || collision.cellIndex >= this.elements.length) {
            return;
        }

        const element = this.elements[collision.cellIndex];

        if (element.type === "input") {
            this.state.input.property = element.label as keyof CellStyleOverridePure;
            this.state.input.value = element.value || "";
            this.input.value = this.state.input.value;
            this.input.focus();
            this.state.selectedInput = collision.cellIndex;
            this.state.animations.blinkingCursor.lastTick = Date.now();
            this.state.animations.blinkingCursor.lastState = "visible";
        } else if (element.type === "button") {
            element.action();
        }
    }

    handleInputChange(event: Event) {
        if (!this.state.selectedCell || this.state.selectedInput < 0 || this.state.selectedInput >= this.elements.length) {
            return;
        }

        this.state.input.value = (event.target as HTMLInputElement).value;

        if (this.state.input.property) {
            const element = this.elements[this.state.selectedInput];

            if (element && element.type === "input") {
                element.value = this.state.input.value;

                if (this.state.selectedCell.editState === "default") {
                    // @ts-ignore
                    this.state.cellStyleChanges[this.state.input.property as keyof CellStyleOverride] = this.state.input.value;
                }

                if (this.state.selectedCell.editState === "hover") {
                    if (this.state.cellStyleChanges.hoverOverride === undefined) {
                        this.state.cellStyleChanges.hoverOverride = {};
                    }

                    //@ts-ignore
                    this.state.cellStyleChanges.hoverOverride[this.state.input.property] = this.state.input.value;
                }

                if (this.state.selectedCell.editState === "selected") {
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
        this.elements = [];

        this.elements.push({
            type: "label",
            label: "default_text1"
        })

        this.state.selectedInput = -1;
        this.state.input.property = null;
        this.state.input.value = "";
        this.input.value = "";
        this.state.cellStyleChanges = {};
        this.state.selectedCell = null;

        this.render();
    }

    selectCell(cellIndex: number) {
        const elements: EditMenuElement[] = [];

        if (cellIndex < 0 || cellIndex >= this.map.mapLayout.cells.length) {
            this.unSelectCell();

            return;
        }

        const cell = this.map.mapLayout.cells[cellIndex];

        if (cell === undefined) {
            throw new Error(`No cell found at index: ${cellIndex}`);
        }

        elements.push({
            type: "hselect",
            label: "hslct_edit_state",
            options: [
                { value: "default", label: "Default" },
                { value: "hover", label: "Hover" },
                { value: "selected", label: "Selected" }
            ],
            selectedOption: 0
        });

        const style = this.map.getSpecifiedCellStyle(cellIndex);

        for (const key of CELL_STYLE_KEYS) {
            elements.push({
                type: "input",
                label: key,
                value: style[key as keyof CellStyleOverridePure]?.toString() || ""
            });
        }

        elements.push({
            type: "button",
            label: "btn_apply",
            action: () => this.applyToMap()
        })

        this.elements = elements;

        this.state.selectedCell = {
            index: cellIndex,
            editState: "default",
            type: cell?.type || null
        }

        this.render();
    }

    applyToMap() {
        if (!this.map || !this.state.selectedCell) return;

        const cellIndex = this.state.selectedCell.index;

        if (cellIndex < 0 || cellIndex >= this.map.mapLayout.cells.length) {
            console.error(`Invalid cell index: ${cellIndex}`);
            return;
        }

        const cell = this.map.mapLayout.cells[cellIndex];

        if (!cell) {
            console.error(`No cell found at index: ${cellIndex}`);
            return;
        }

        if (!cell.styleOverride) {
            cell.styleOverride = {};
        }

        // Apply the style changes to the cell
        Object.assign(cell.styleOverride, this.state.cellStyleChanges);

        for (const key in cell.styleOverride) {
            if (cell.styleOverride[key as keyof CellStyleOverridePure] === "") {
                delete cell.styleOverride[key as keyof CellStyleOverridePure];
            }
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

        const collisions: Collision[] = [];

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

                if (element.value && element.value.length > 0) {
                    this.ctx.fillStyle = "#000";
                    this.ctx.font = `16px Arial`;
                    const textMeasurements = this.ctx.measureText(element.value);
                    const textHeight = textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent;

                    this.ctx.fillText(element.value, cursorMarginX, lastElementYEnd + (inputHeight / 2) + (textHeight / 2));

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
                    cellIndex: i
                })

                lastElementYEnd += 30 + marginY;
            } else if (element.type === "button") {
                // Button rendering logic here
                this.ctx.fillStyle = "#00F";
                this.ctx.fillRect(paddingX, lastElementYEnd, inputWidth, inputHeight);
                this.ctx.fillStyle = "#FFF";
                this.ctx.font = `16px Arial`;

                this.ctx.fillText(label, paddingX + inputPadding, lastElementYEnd + (inputHeight / 2) + 5);

                collisions.push({
                    x: paddingX,
                    y: lastElementYEnd,
                    width: inputWidth,
                    height: inputHeight,
                    cellIndex: i
                });

                lastElementYEnd += inputHeight + marginY;
            } else if (element.type === "hselect") {
                // Select rendering logic here
                this.ctx.fillStyle = "#F00";
                this.ctx.fillRect(paddingX, lastElementYEnd, inputWidth, inputHeight);
                this.ctx.fillStyle = "#FFF";
                this.ctx.font = `16px Arial`;

                this.ctx.fillText(label, paddingX + inputPadding, lastElementYEnd + (inputHeight / 2) + 5);

                collisions.push({
                    x: paddingX,
                    y: lastElementYEnd,
                    width: inputWidth,
                    height: inputHeight,
                    cellIndex: i
                });

                lastElementYEnd += inputHeight + marginY;
            }
        }

        this.collisions.registerPotentialCollisions(collisions);
    }
}