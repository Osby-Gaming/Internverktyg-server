import CollisionManager from "./CollisionManager";
import { DEFAULT_MAP_BACKGROUND_COLOR, DEFAULT_ZOOM_LEVEL, CELL_SIZE, ZOOM_LEVELS, MIN_ZOOM, MAX_ZOOM, DEFAULT_CELL_STYLES } from "./data";
import EditMenu from "./EditMenu";
import { Cell, CellStyleOverride, Collision, MapLayout, MapLayoutInput, MapMode } from "./types";

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
        mouseX: number;
        mouseY: number;
        mouseDown: boolean;
    } = {
            keysPressed: [],
            mouseX: 0,
            mouseY: 0,
            mouseDown: false
        }

    collisions: CollisionManager;
    editMenu: EditMenu | null = null;

    ongoingTouches: { identifier: number, pageX: number, pageY: number }[] = [];

    state: {
        hoveredCell: number
        selectedCell: number
    } = {
            hoveredCell: -1,
            selectedCell: -1
        }

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
                this.camera.zoom = ZOOM_LEVELS.findLast((level, _) => {
                    if (level < this.camera.zoom) {
                        return true;
                    }
                    return false;
                }) ?? MIN_ZOOM;
            } else {
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

        this.collisions.addEventListener("hover", (collision) => {
            if (this.state.hoveredCell === collision.cellIndex) {
                return;
            };

            this.state.hoveredCell = collision.cellIndex;

            this.render();
        });

        this.collisions.addEventListener("click", (collision) => {
            if (this.state.selectedCell === collision.cellIndex) {
                this.state.selectedCell = -1;
            } else {
                this.state.selectedCell = collision.cellIndex;
            }

            if (this.mode === "edit") {
                this.editMenu?.selectCell(this.state.selectedCell);
            }

            this.render();
        })

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
        const collisions: Collision[] = [];

        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

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

        for (let x = 1; x < (columnsAmount + 1); x++) {
            this.ctx.globalAlpha = 1;
            if (this.mode === "edit") {
                const xPos = -(renderedCellSize - marginX) + x * renderedCellSize - zoomAdjustedCameraXPos;
                const yPos = -(renderedCellSize - marginY) - zoomAdjustedCameraYPos;

                this.ctx.strokeStyle = "#0FF";
                this.ctx.lineWidth = 0.5 * this.camera.zoom;
                this.ctx.strokeRect(xPos, yPos, renderedCellSize, renderedCellSize);

                const yPos2 = -(renderedCellSize - marginY) - zoomAdjustedCameraYPos + renderedCellSize * (rowsAmount + 1);

                this.ctx.strokeStyle = "#0FF";
                this.ctx.lineWidth = 0.5 * this.camera.zoom;
                this.ctx.strokeRect(xPos, yPos2, renderedCellSize, renderedCellSize);
            }
        }

        for (let y = 0; y < (rowsAmount); y++) {
            this.ctx.globalAlpha = 1;
            if (this.mode === "edit") {
                const xPos = -(renderedCellSize - marginX) - zoomAdjustedCameraXPos;
                const yPos = -(renderedCellSize - marginY) + y * renderedCellSize - zoomAdjustedCameraYPos + renderedCellSize;

                this.ctx.strokeStyle = "#0FF";
                this.ctx.lineWidth = 0.5 * this.camera.zoom;
                this.ctx.strokeRect(xPos, yPos, renderedCellSize, renderedCellSize);

                const xPos2 = -(renderedCellSize - marginX) - zoomAdjustedCameraXPos + renderedCellSize * (columnsAmount + 1);

                this.ctx.strokeStyle = "#0FF";
                this.ctx.lineWidth = 0.5 * this.camera.zoom;
                this.ctx.strokeRect(xPos2, yPos, renderedCellSize, renderedCellSize);
            }

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
                            cellIndex: cellIndex
                        });

                        this.ctx.strokeStyle = "#CCC";
                        this.ctx.lineWidth = 0.5 * this.camera.zoom;
                        this.ctx.strokeRect(xPos, yPos, renderedCellSize, renderedCellSize);

                        this.ctx.globalAlpha = 0.4;

                        if (this.state.selectedCell === cellIndex) {
                            this.ctx.fillStyle = "lightgreen";
                            this.ctx.fillRect(xPos, yPos, renderedCellSize, renderedCellSize);
                        } else if (this.state.hoveredCell === cellIndex) {
                            this.ctx.fillStyle = "lightblue";
                            this.ctx.fillRect(xPos, yPos, renderedCellSize, renderedCellSize);
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
                    cellIndex: cellIndex
                });

                this.ctx.globalAlpha = opacity;

                this.ctx.strokeStyle = borderColor;
                this.ctx.lineWidth = borderWidth * this.camera.zoom;
                this.ctx.strokeRect(xPos, yPos, renderedCellSize, renderedCellSize);

                this.ctx.fillStyle = backgroundColor;
                this.ctx.fillRect(xPos, yPos, renderedCellSize, renderedCellSize);

                if (text) {
                    this.ctx.fillStyle = "#000";
                    this.ctx.font = `${12 * this.camera.zoom}px Arial`;
                    const textMeasurements = this.ctx.measureText(text);
                    const textWidth = textMeasurements.actualBoundingBoxRight - textMeasurements.actualBoundingBoxLeft;
                    const textHeight = textMeasurements.actualBoundingBoxAscent + textMeasurements.actualBoundingBoxDescent;
                    const textXPos = xPos + (renderedCellSize / 2) - (textWidth / 2);
                    const textYPos = yPos + (renderedCellSize / 2) + (textHeight / 2);
                    this.ctx.fillText(text, textXPos, textYPos);
                }
            }
        }

        this.collisions.registerPotentialCollisions(collisions);
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

        let style = { ...DEFAULT_CELL_STYLES[cell.type], hoverOverride: undefined } as { backgroundColor: string, borderColor: string, borderWidth: number, text: string, opacity: number }

        if (hoverState) {
            style = { ...style, ...DEFAULT_CELL_STYLES[cell.type].hoverOverride };
        }
        if (selectedState) {
            style = { ...style, ...DEFAULT_CELL_STYLES[cell.type].selectedOverride };
        }

        return { ...style, ...cell.styleOverride };
    }

    copyTouchEvent({ identifier, pageX, pageY }: Touch) {
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
}