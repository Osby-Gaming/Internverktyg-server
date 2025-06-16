import CollisionManager from "./CollisionManager";
import { DEFAULT_MAP_BACKGROUND_COLOR, DEFAULT_ZOOM_LEVEL, CELL_SIZE, ZOOM_LEVELS, MIN_ZOOM, MAX_ZOOM, DEFAULT_CELL_STYLES, MouseButtons } from "./data";
import EditMenu from "./EditMenu";
import { Cell, CellStyleOverride, Collision, MapLayout, MapLayoutInput, MapMode, MapRenderInstruction } from "./types";
import { FPSCounter } from "./util";

export default class Map {
    mode: MapMode;
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D | null;

    mapLayout: MapLayout;
    mapWidth: number;
    mapHeight: number;

    camera: {
        x: number;
        y: number;
        zoom: number;
    } = {
            x: 0,
            y: 0,
            zoom: 1,
        }

    controller: {
        keysPressed: string[];
    } = {
            keysPressed: []
        }

    collisions: CollisionManager<number>;
    editMenu: EditMenu | null = null;

    ongoingTouches: { identifier: number, pageX: number, pageY: number }[] = [];

    state: {
        hoveredCell: number
        selectedCell: number
    } = {
            hoveredCell: -1,
            selectedCell: -1
        }

    fpsCounter: FPSCounter = new FPSCounter();

    lastFrame: MapRenderInstruction[][] = [];

    static inputProcessing(input: MapLayoutInput) {
        const processedObjects: Cell[] = [];

        for (let i = 0; i < input.cells.length; i++) {
            const cell = input.cells[i];

            if (typeof cell === "string") {
                const count = parseInt(cell, 10);
                for (let j = 0; j < count; j++) {
                    processedObjects.push(null);
                }
            } else {
                processedObjects.push(cell);
            }
        }

        if (processedObjects.length !== input.x * input.y) {
            throw new Error(`Invalid map layout: expected ${input.x * input.y} cells, got ${processedObjects.length}`);
        }

        return {
            x: input.x,
            y: input.y,
            cells: processedObjects,
            globalOverride: {
                backgroundColor: input.globalOverride?.backgroundColor || DEFAULT_MAP_BACKGROUND_COLOR,
                zoomLevel: input.globalOverride?.zoomLevel || DEFAULT_ZOOM_LEVEL,
                cellStyleOverride: {
                    seat: input.globalOverride?.cellStyleOverride?.seat,
                    aisle: input.globalOverride?.cellStyleOverride?.aisle,
                    wall: input.globalOverride?.cellStyleOverride?.wall,
                    door: input.globalOverride?.cellStyleOverride?.door,
                    custom: input.globalOverride?.cellStyleOverride?.custom
                }
            }
        } as MapLayout;
    }

    constructor(mode: MapMode, canvasId: string, mapLayout: MapLayoutInput, editMenuId?: string) {
        this.mode = mode;

        this.mapLayout = Map.inputProcessing(mapLayout);
        this.mapWidth = mapLayout.x * CELL_SIZE;
        this.mapHeight = mapLayout.y * CELL_SIZE;

        this.camera.zoom = this.mapLayout.globalOverride.zoomLevel;

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.ctx = this.canvas.getContext("2d", { alpha: false });

        this.collisions = new CollisionManager(this);

        if (this.mode === "edit") {
            if (!editMenuId) {
                throw new Error("Edit mode requires an edit menu ID to be provided.");
            }

            const el = document.getElementById(editMenuId);

            if (!el) {
                throw new Error(`Edit menu element with ID ${editMenuId} not found.`);
            }

            el.style.display = "block";

            this.editMenu = new EditMenu(this, editMenuId);
        }

        this.canvas.addEventListener("wheel", (event) => {
            if (event.deltaY > 0) {
                if (this.camera.zoom === ZOOM_LEVELS[0]) {
                    return this.camera.zoom;
                }

                this.camera.zoom = ZOOM_LEVELS.findLast((level, _) => {
                    if (level < this.camera.zoom) {
                        return true;
                    }
                    return false;
                }) ?? MIN_ZOOM;
            } else {
                if (this.camera.zoom === ZOOM_LEVELS[ZOOM_LEVELS.length - 1]) {
                    return this.camera.zoom;
                }
                this.camera.zoom = ZOOM_LEVELS.find((level, _) => {
                    if (level > this.camera.zoom) {
                        return true;
                    }
                    return false;
                }) ?? MAX_ZOOM;
            }

            this.keepCameraConstraints();
        });

        this.canvas.addEventListener("keydown", (event) => {
            if (this.controller.keysPressed.includes(event.key)) return;

            this.controller.keysPressed.push(event.key);

            this.runKeyboardControls();
        });

        this.canvas.addEventListener("keyup", (event) => {
            const index = this.controller.keysPressed.indexOf(event.key);

            if (index > -1) {
                this.controller.keysPressed.splice(index, 1);
            }

            this.runKeyboardControls();
        })

        setInterval(() => {
            this.runKeyboardControls();
        }, 32);

        this.canvas.addEventListener("touchstart", this.handleTouchStartDecorator(() => this));
        this.canvas.addEventListener("touchend", this.handleTouchEndDecorator(() => this));
        this.canvas.addEventListener("touchcancel", this.handleTouchCancelDecorator(() => this));
        this.canvas.addEventListener("touchmove", this.handleTouchMoveDecorator(() => this));

        this.collisions.addEventListener("hover", (collision: Collision<number>) => {
            if (this.state.hoveredCell === collision.reference) {
                return;
            };

            this.state.hoveredCell = collision.reference;

            if (collision.reference === -1) {
                this.setCursor("grab");
            } else {
                this.setCursor("pointer");
            }

            this.render();
        });

        this.collisions.addEventListener("click", (collision: Collision<number>, mouseButtonsDown) => {
            if (!mouseButtonsDown || !mouseButtonsDown.includes(MouseButtons.LEFT)) {
                return;
            }

            this.setCursor("pointer");

            if (this.state.selectedCell === collision.reference) {
                this.state.selectedCell = -1;
            } else {
                this.state.selectedCell = collision.reference;
            }

            if (this.mode === "edit") {
                this.editMenu?.selectCell(this.state.selectedCell);
            }

            this.render();
        })

        this.collisions.addEventListener("drag", (diffX: number, diffY: number) => {
            this.camera.x -= diffX / this.camera.zoom;
            this.camera.y -= diffY / this.camera.zoom;

            this.setCursor("grabbing");

            this.keepCameraConstraints();
        });

        this.collisions.addEventListener("dragend", () => {
            if (this.state.hoveredCell === -1) {
                this.setCursor("grab");
            } else {
                this.setCursor("pointer");
            }

            this.render();
        });

        this.render();
    }

    handleTouchStartDecorator(mapGetter: () => Map) {
        return (event: TouchEvent) => {
            event.preventDefault();

            const touches = event.changedTouches;

            for (let i = 0; i < touches.length; i++) {
                this.ongoingTouches.push(mapGetter().copyTouchEvent(touches[i]));
            }
        }
    }

    handleTouchEndDecorator(mapGetter: () => Map) {
        return (event: TouchEvent) => {
            event.preventDefault();

            const touches = event.changedTouches;

            for (let i = 0; i < touches.length; i++) {
                const idx = mapGetter().ongoingTouchIndexById(touches[i].identifier);

                if (idx >= 0) {
                    mapGetter().ongoingTouches.splice(idx, 1);
                }
            }
        }
    }

    handleTouchCancelDecorator(mapGetter: () => Map) {
        return (event: TouchEvent) => {
            event.preventDefault();

            const touches = event.changedTouches;

            for (let i = 0; i < touches.length; i++) {
                const idx = mapGetter().ongoingTouchIndexById(touches[i].identifier);

                if (idx >= 0) {
                    mapGetter().ongoingTouches.splice(idx, 1);
                }
            }
        }
    }

    handleTouchMoveDecorator(mapGetter: () => Map) {
        return (event: TouchEvent) => {
            event.preventDefault();
            const touches = event.changedTouches;

            const mapContext = mapGetter();

            if (touches.length !== 2) {
                const idx = mapContext.ongoingTouchIndexById(touches[0].identifier);

                if (idx >= 0) {
                    const touch = mapContext.ongoingTouches[idx];
                    const dx = touches[0].pageX - touch.pageX;
                    const dy = touches[0].pageY - touch.pageY;

                    mapContext.camera.x -= dx / mapContext.camera.zoom;
                    mapContext.camera.y -= dy / mapContext.camera.zoom;

                    mapContext.ongoingTouches.splice(idx, 1, mapContext.copyTouchEvent(touches[0]));
                }
            }

            if (touches.length === 2) {
                const idx1 = mapContext.ongoingTouchIndexById(touches[0].identifier);
                const idx2 = mapContext.ongoingTouchIndexById(touches[1].identifier);

                if (idx1 >= 0 && idx2 >= 0) {
                    const touch1 = mapContext.ongoingTouches[idx1];
                    const touch2 = mapContext.ongoingTouches[idx2];

                    const dx1 = touches[0].pageX - touch1.pageX;
                    const dy1 = touches[0].pageY - touch1.pageY;
                    const dx2 = touches[1].pageX - touch2.pageX;
                    const dy2 = touches[1].pageY - touch2.pageY;

                    const distanceBefore = Math.sqrt(dx1 * dx1 + dy1 * dy1);
                    const distanceAfter = Math.sqrt(dx2 * dx2 + dy2 * dy2);

                    mapContext.camera.zoom *= distanceAfter / distanceBefore;

                    mapContext.camera.zoom = Math.min(Math.max(MIN_ZOOM, mapContext.camera.zoom), MAX_ZOOM);

                    mapContext.ongoingTouches.splice(idx1, 1, mapContext.copyTouchEvent(touches[0]));
                    mapContext.ongoingTouches.splice(idx2, 1, mapContext.copyTouchEvent(touches[1]));
                }
            }

            mapContext.keepCameraConstraints();
        }
    }

    runKeyboardControls() {
        if (this.controller.keysPressed.length > 0) {
            let multiplier = this.controller.keysPressed.includes("Shift") ? 3 : 1;

            if ((this.controller.keysPressed.includes("ArrowUp") || this.controller.keysPressed.includes("ArrowDown"))
                && (this.controller.keysPressed.includes("ArrowLeft") || this.controller.keysPressed.includes("ArrowRight"))
                && !(this.controller.keysPressed.includes("ArrowUp") && this.controller.keysPressed.includes("ArrowDown"))
                && !(this.controller.keysPressed.includes("ArrowLeft") && this.controller.keysPressed.includes("ArrowRight"))) {
                multiplier /= Math.sqrt(2); // Diagonal movement adjustment when using only two arrow keys that make a diagonal, based on Pythagorean theorem
            }

            if (this.controller.keysPressed.includes("ArrowUp")) {
                this.camera.y -= 10 * multiplier;
            }
            if (this.controller.keysPressed.includes("ArrowDown")) {
                this.camera.y += 10 * multiplier;
            }
            if (this.controller.keysPressed.includes("ArrowLeft")) {
                this.camera.x -= 10 * multiplier;
            }
            if (this.controller.keysPressed.includes("ArrowRight")) {
                this.camera.x += 10 * multiplier;
            }

            this.keepCameraConstraints();
        }
    }

    keepCameraConstraints() {
        const maxY = (this.mapHeight) - (this.canvas.height / 2);
        const minY = 0 - (this.canvas.height / 2);

        if (this.camera.y > maxY) {
            this.camera.y = maxY;
        } else if (this.camera.y < minY) {
            this.camera.y = minY;
        }

        const maxX = (this.mapWidth) - (this.canvas.width / 2);
        const minX = 0 - (this.canvas.width / 2);

        if (this.camera.x > maxX) {
            this.camera.x = maxX;
        } else if (this.camera.x < minX) {
            this.camera.x = minX;
        }

        this.render();
    }

    render() {
        const collisions: Collision<number>[] = [];
        const layers: MapRenderInstruction[][] = [
            [], // Cell layer
            [], // Border layer
            []  // Text layer
        ];

        if (!this.ctx) return;

        const renderedCellSize = CELL_SIZE * this.camera.zoom;
        const columnsAmount = this.mapLayout.x;
        const rowsAmount = this.mapLayout.y;

        const zoomAdjustedCameraXPos = this.camera.x * this.camera.zoom;
        const zoomAdjustedCameraYPos = this.camera.y * this.camera.zoom;

        let marginX = 0;
        let marginY = 0;

        if (columnsAmount * CELL_SIZE < this.canvas.width) {
            marginX = (this.canvas.width - (columnsAmount * renderedCellSize)) / 2;
        }
        if (rowsAmount * CELL_SIZE < this.canvas.height) {
            marginY = (this.canvas.height - (rowsAmount * renderedCellSize)) / 2;
        }

        const visibleWindowTolerance = {
            x: this.canvas.width * this.camera.zoom + (renderedCellSize * 2),
            y: this.canvas.height * this.camera.zoom + (renderedCellSize * 2)
        };

        if (this.mode === "edit") {
            layers[0].push({
                type: "strokerect",
                x: -(renderedCellSize - marginX) - zoomAdjustedCameraXPos,
                y: -(renderedCellSize - marginY) - zoomAdjustedCameraYPos,
                width: (columnsAmount + 2) * renderedCellSize,
                height: (rowsAmount + 2) * renderedCellSize,
                color: "#0FF",
                lineWidth: 0.5 * this.camera.zoom,
                opacity: 1
            })

            for (let x = 1; x < (columnsAmount + 2); x++) {
                const xPos = -(renderedCellSize - marginX) + x * renderedCellSize - zoomAdjustedCameraXPos;
                const yPos = -(renderedCellSize - marginY) - zoomAdjustedCameraYPos;

                layers[0].push({
                    type: "strokerect",
                    x: xPos,
                    y: yPos + renderedCellSize,
                    width: 1,
                    height: rowsAmount * renderedCellSize,
                    color: "#CCC",
                    lineWidth: 1 * this.camera.zoom,
                    opacity: 0.4
                })
            }

            for (let y = 0; y < (rowsAmount + 1); y++) {
                const xPos = -(renderedCellSize - marginX) - zoomAdjustedCameraXPos;
                const yPos = -(renderedCellSize - marginY) + y * renderedCellSize - zoomAdjustedCameraYPos;

                layers[0].push({
                    type: "strokerect",
                    x: xPos + renderedCellSize,
                    y: yPos + renderedCellSize,
                    width: columnsAmount * renderedCellSize,
                    height: 1,
                    color: "#CCC",
                    lineWidth: 1 * this.camera.zoom,
                    opacity: 0.4
                })
            }
        }

        for (let y = 0; y < (rowsAmount); y++) {
            this.ctx.globalAlpha = 1;

            for (let x = 0; x < columnsAmount; x++) {
                this.ctx.globalAlpha = 1;
                const cellIndex = y * columnsAmount + x;
                const cell = this.mapLayout.cells[cellIndex];

                if (!cell) {
                    if (this.mode === "edit") {
                        const xPos = x * renderedCellSize + marginX - zoomAdjustedCameraXPos;
                        const yPos = y * renderedCellSize + marginY - zoomAdjustedCameraYPos;

                        collisions.push({
                            x: xPos,
                            y: yPos,
                            width: renderedCellSize,
                            height: renderedCellSize,
                            reference: cellIndex
                        });

                        let backgroundColor;

                        if (this.state.selectedCell === cellIndex) {
                            backgroundColor = "lightgreen";
                        } else if (this.state.hoveredCell === cellIndex) {
                            backgroundColor = "lightblue";
                        }

                        if (backgroundColor) {
                            layers[0].push({
                                type: "fillrect",
                                x: xPos,
                                y: yPos,
                                width: renderedCellSize,
                                height: renderedCellSize,
                                color: backgroundColor,
                                opacity: 0.4
                            });
                        }
                    }

                    continue;
                };

                const { backgroundColor, borderColor, borderWidth, text, opacity } = this.getCellStyle(cell, this.state.hoveredCell === cellIndex, this.state.selectedCell === cellIndex);

                const xPos = x * renderedCellSize + marginX - zoomAdjustedCameraXPos;
                const yPos = y * renderedCellSize + marginY - zoomAdjustedCameraYPos;

                // Check if the cell is within the visible window adjusted for zoom
                if (xPos + renderedCellSize < -visibleWindowTolerance.x || xPos > this.canvas.width + visibleWindowTolerance.x ||
                    yPos + renderedCellSize < -visibleWindowTolerance.y || yPos > this.canvas.height + visibleWindowTolerance.y) {
                    continue;
                }

                collisions.push({
                    x: xPos,
                    y: yPos,
                    width: renderedCellSize,
                    height: renderedCellSize,
                    reference: cellIndex
                });

                layers[1].push({
                    type: "strokerect",
                    x: xPos,
                    y: yPos,
                    width: renderedCellSize,
                    height: renderedCellSize,
                    color: borderColor,
                    lineWidth: borderWidth * this.camera.zoom,
                    opacity: opacity
                })

                layers[0].push({
                    type: "fillrect",
                    x: xPos,
                    y: yPos,
                    width: renderedCellSize,
                    height: renderedCellSize,
                    color: backgroundColor,
                    opacity: opacity
                })

                if (text) {
                    this.ctx.font = `${12 * this.camera.zoom}px Arial`
                    const textMeasurements = this.ctx.measureText(text);
                    const textWidth = textMeasurements.actualBoundingBoxRight - textMeasurements.actualBoundingBoxLeft;
                    const textHeight = textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent;
                    const textXPos = xPos + (renderedCellSize / 2) - (textWidth / 2);
                    const textYPos = yPos + (renderedCellSize / 2) + (textHeight / 2);

                    layers[2].push({
                        type: "text",
                        x: textXPos,
                        y: textYPos,
                        text: text,
                        font: this.ctx.font,
                        color: "#000",
                        opacity: opacity
                    });
                }
            }
        }

        if (JSON.stringify(this.lastFrame) !== JSON.stringify(layers)) {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            for (let layer of layers) {
                for (let instruction of layer) {
                    if (instruction.type === "fillrect") {
                        if (instruction.x + instruction.width < 0 || instruction.x > this.canvas.width ||
                            instruction.y + instruction.height < 0 || instruction.y > this.canvas.height) {
                            continue; // Skip rendering if out of bounds
                        }
                        this.ctx.fillStyle = instruction.color;
                        this.ctx.globalAlpha = instruction.opacity;
                        this.ctx.fillRect(instruction.x, instruction.y, instruction.width, instruction.height);
                    }
    
                    if (instruction.type === "strokerect") {
                        if (instruction.x + instruction.width < 0 || instruction.x > this.canvas.width ||
                            instruction.y + instruction.height < 0 || instruction.y > this.canvas.height) {
                            continue; // Skip rendering if out of bounds
                        }
                        this.ctx.strokeStyle = instruction.color;
                        this.ctx.lineWidth = instruction.lineWidth;
                        this.ctx.globalAlpha = instruction.opacity;
                        this.ctx.strokeRect(instruction.x, instruction.y, instruction.width, instruction.height);
                    }
    
                    if (instruction.type === "text") {
                        this.ctx.font = instruction.font;
                        this.ctx.globalAlpha = instruction.opacity;
                        this.ctx.fillStyle = instruction.color;
                        this.ctx.fillText(instruction.text, instruction.x, instruction.y);
                    }
                }
            }

            this.lastFrame = layers;
        }

        this.collisions.registerCollisions(collisions);

        if (this.mode === "edit" || this.mode === "preview") {
            this.ctx.font = `${16}px Arial`;
            this.ctx.fillStyle = "#0F0";
            this.ctx.fillText(this.fpsCounter.frameCount.toString(), 10, 20);

            this.fpsCounter.tick();
        }
    }

    getSpecifiedCellStyle(cellIndex: number): CellStyleOverride {
        const cell = this.mapLayout.cells[cellIndex];

        return cell?.styleOverride || {};
    }

    getCellStyle(cell: Cell, hoverState: boolean, selectedState: boolean): { backgroundColor: string, borderColor: string, borderWidth: number, text: string, opacity: number } {
        if (cell === null) {
            return {
                backgroundColor: "#000",
                borderColor: "#000",
                borderWidth: 0,
                text: "",
                opacity: 0
            };
        }

        let style = { ...DEFAULT_CELL_STYLES[cell.type] } as { backgroundColor: string, borderColor: string, borderWidth: number, text: string, opacity: number }

        for (const key in style) {
            if (key === "hoverOverride" || key === "selectedOverride") continue;

            // @ts-ignore
            style[key] = cell.styleOverride?.[key] || style[key];
        }

        if (hoverState) {
            Object.assign(style, DEFAULT_CELL_STYLES[cell.type].hoverOverride);
            Object.assign(style, cell.styleOverride || {});

            if (cell.styleOverride?.hoverOverride) {
                Object.assign(style, cell.styleOverride.hoverOverride);
            }
        }
        if (selectedState) {
            Object.assign(style, DEFAULT_CELL_STYLES[cell.type].selectedOverride);
            Object.assign(style, cell.styleOverride || {});
            Object.assign(style, cell.styleOverride?.hoverOverride || {});

            if (cell.styleOverride?.selectedOverride) {
                Object.assign(style, cell.styleOverride.selectedOverride);
            }
        }

        return style;
    }

    public togglePreview() {
        if (this.mode === "edit") {
            this.mode = "preview";
        } else if (this.mode === "preview") {
            this.mode = "edit";
        }

        this.state.selectedCell = -1;
        this.state.hoveredCell = -1;

        this.render();
    }

    exportMapLayout(): MapLayoutInput {
        const cells: (Cell | `${number}`)[] = [];

        let comboCount = 0;

        for (let cell of this.mapLayout.cells) {
            if (cell === null) {
                comboCount++;

                continue;
            }

            if (comboCount > 0) {
                cells.push(`${comboCount}`);
                comboCount = 0;
            }

            const cellCopy: Cell = { ...cell };

            cells.push(cellCopy);
        }

        if (comboCount > 0) {
            cells.push(`${comboCount}`);
        }

        return {
            x: this.mapLayout.x,
            y: this.mapLayout.y,
            cells: cells,
            globalOverride: {
                backgroundColor: this.mapLayout.globalOverride.backgroundColor,
                zoomLevel: this.mapLayout.globalOverride.zoomLevel,
                cellStyleOverride: {
                    seat: this.mapLayout.globalOverride.cellStyleOverride.seat,
                    aisle: this.mapLayout.globalOverride.cellStyleOverride.aisle,
                    wall: this.mapLayout.globalOverride.cellStyleOverride.wall,
                    door: this.mapLayout.globalOverride.cellStyleOverride.door,
                    custom: this.mapLayout.globalOverride.cellStyleOverride.custom
                }
            }
        }
    }

    private copyTouchEvent({ identifier, pageX, pageY }: Touch) {
        return { identifier, pageX, pageY };
    }

    ongoingTouchIndexById(idToFind: number) {
        for (let i = 0; i < this.ongoingTouches.length; i++) {
            const id = this.ongoingTouches[i].identifier;

            if (id === idToFind) {
                return i;
            }
        }
        return -1;
    }

    private setCursor(cursor: string) {
        this.canvas.style.cursor = cursor;
    }
}