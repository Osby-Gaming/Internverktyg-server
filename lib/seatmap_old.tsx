"use client";

import { useEffect } from "react";

export default function Seatmap({ className, editMenuClassName }: { className: string, editMenuClassName: string }) {
    useEffect(() => {
        const map = new Map("edit", "seatmap_area", {
            x: 76,
            y: 33,
            objects: [
                "1000",
                { id: "1", name: "1", type: "seat" },
                { id: "2", name: "2", type: "aisle" },
                { id: "3", name: "3", type: "wall" },
                { id: "5", name: "4", type: "door" },
                { id: "6", name: "1", type: "custom" },
                { id: "7", name: "2", type: "seat" },
                { id: "8", name: "3", type: "aisle" },
                { id: "9", name: "4", type: "wall" },
                { id: "10", name: "1", type: "door" },
                { id: "11", name: "2", type: "custom" },
                { id: "12", name: "3", type: "seat" },
                { id: "13", name: "4", type: "aisle" },
                "1496"
            ]
        }, "edit_menu");
    })
    return (
        <>
            <canvas tabIndex={1} className={className} id="seatmap_area">
                Javascript is required to render the seatmap.
            </canvas>
            <div className={"absolute bottom-0 right-0 bg-[rgba(0,0,0,0.6)] hidden " + editMenuClassName} id="edit_menu">
                <input tabIndex={2} type="text" className="opacity-0 w-0 h-0 p-0" />
                <canvas tabIndex={3} className="w-full h-full absolute bottom-0 right-0"></canvas>
            </div>
        </>
    );
}

const CELL_SIZE = 25; // Size of each cell in pixels
const MAX_ZOOM = 6; // Maximum zoom level
const MIN_ZOOM = 0.8; // Minimum zoom level
const ZOOM_LEVELS = [0.8, 1, 1.2, 1.5, 2, 3, 4, 5, 6]; // Predefined zoom levels

const DEFAULT_MAP_BACKGROUND_COLOR = "#000";
const DEFAULT_ZOOM_LEVEL: PossibleZoomLevels = 1;

const DEFAULT_CELL_STYLES: Record<CellType, CellStyleOverride> = {
    seat: {
        backgroundColor: "#0F0",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            backgroundColor: "#0F0",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 0.5,
        },
        selectedOverride: {
            backgroundColor: "#0F0",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 0.2,
        }
    },
    aisle: {
        backgroundColor: "#FFF",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 1,
        },
        selectedOverride: {
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 1,
        }
    },
    wall: {
        backgroundColor: "#CCC",
        borderColor: "#000",
        borderWidth: 1,
        text: "2",
        opacity: 1,
        hoverOverride: {
            backgroundColor: "#CCC",
            borderColor: "#000",
            borderWidth: 2,
            text: "1",
            opacity: 1,
        },
        selectedOverride: {
            backgroundColor: "#CCC",
            borderColor: "#000",
            borderWidth: 2,
            text: "1",
            opacity: 1,
        }
    },
    door: {
        backgroundColor: "#F00",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            backgroundColor: "#F00",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 0.6,
        },
        selectedOverride: {
            backgroundColor: "#F00",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 0.6,
        }
    },
    custom: {
        backgroundColor: "#FFF",
        borderColor: "#000",
        borderWidth: 1,
        text: "",
        opacity: 1,
        hoverOverride: {
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 1,
        },
        selectedOverride: {
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 2,
            text: "",
            opacity: 1,
        }
    }
}

const EDITMENU_LABELS: Record<string, string> = {
    backgroundColor: "Background Color",
    borderColor: "Border Color",
    borderWidth: "Border Width",
    text: "Text",
    opacity: "Opacity",
    default_text1: "Click on a cell to edit it"
};

const CELL_STYLE_KEYS = Object.keys(EDITMENU_LABELS).slice(0, 5);

export type CellType = "seat" | "aisle" | "wall" | "door" | "custom";

export type Cell = {
    id: string;
    name: string;
    type: CellType;
    styleOverride?: CellStyleOverride
} | null;

export type CellStyleOverridePure = {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    text?: string;
    opacity?: number;
}

export type CellStyleOverride = CellStyleOverridePure & {
    hoverOverride?: CellStyleOverridePure,
    selectedOverride?: CellStyleOverridePure
}

export type PossibleZoomLevels = 0.8 | 1 | 1.2 | 1.5 | 2 | 3 | 4 | 5 | 6;

export type MapLayoutInput = {
    x: number;
    y: number;
    objects: (Cell | `${number}`)[]; // putting an Int will create the Ints amount of null cells
    globalOverride?: {
        backgroundColor?: string;
        zoomLevel?: PossibleZoomLevels;
        cellStyleOverride?: {
            seat?: CellStyleOverride
            aisle?: CellStyleOverride
            wall?: CellStyleOverride
            door?: CellStyleOverride
            custom?: CellStyleOverride
        }
    }
};

export type MapLayout = {
    x: number;
    y: number;
    objects: Cell[];
    globalOverride: {
        backgroundColor: string;
        zoomLevel: PossibleZoomLevels;
        cellStyleOverride: {
            seat?: CellStyleOverride
            aisle?: CellStyleOverride
            wall?: CellStyleOverride
            door?: CellStyleOverride
            custom?: CellStyleOverride
        }
    }
};

export type Collision = {
    x: number;
    y: number;
    width: number;
    height: number;
    cellIndex: number;
}

export type EditMenuState = {
    input: {
        property: keyof CellStyleOverridePure | null;
        value: string;
    },
    animations: {
        blinkingCursor: {
            lastTick: number;
            lastState: "visible" | "hidden";
            interval: number;
        }
    },
    selectedInput: number
}

export type EditMenuElement = {
    type: "input" | "button" | "label" | "select";
    label: string;
    value?: string;
    options?: { value: string, label: string }[];
}

export type MapMode = "view" | "edit";

class FPSCounter {
    public frameCount: number = 0;
    private frames: number[] = [];

    public tick() {
        const now = performance.now();
        this.frames.push(now);

        // Remove frames older than 1 second
        while (this.frames.length > 0 && this.frames[0] <= now - 1000) {
            this.frames.shift();
        }

        this.frameCount = this.frames.length;
    }
}

class EditMenu {
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
            selectedInput: -1
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

        this.input.addEventListener("input", (event) => {
            this.state.input.value = (event.target as HTMLInputElement).value;

            if (this.state.input.property) {
                const element = this.elements[this.state.selectedInput];

                if (element) {
                    element.value = this.state.input.value;
                }
            }

            this.render();
        })

        this.collisions.addEventListener("click", (collision) => {
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
                // Handle button click logic here
            }
        });

        setInterval(() => {
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
        }, 50)

        this.unSelectCell();

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

        this.render();
    }

    selectCell(cellIndex: number) {
        const elements: EditMenuElement[] = [];

        if (cellIndex < 0 || cellIndex >= this.map.mapLayout.objects.length) {
            this.unSelectCell();

            return;
        }

        const cell = this.map.mapLayout.objects[cellIndex];

        if (!cell && this.map.mode === "view") {
            throw new Error(`No cell found at index: ${cellIndex}`);
        }

        const style = this.map.getSpecifiedCellStyle(cellIndex);

        for (const key of CELL_STYLE_KEYS) {
            elements.push({
                type: "input",
                label: key,
                value: style[key as keyof CellStyleOverridePure]?.toString() || ""
            });
        }

        this.elements = elements;

        this.render();
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
            }
        }

        this.collisions.registerPotentialCollisions(collisions);
    }
}

class CollisionManager {
    collisions: {
        potentialCollisions: Collision[];
        activeMouseCollisions: Collision[];
        activeMouseHoverCollisions: Collision[];
    } = {
            potentialCollisions: [],
            activeMouseCollisions: [],
            activeMouseHoverCollisions: []
        }

    map: Map | EditMenu;

    listeners: {
        click: ((collission: Collision) => void)[],
        hover: ((collission: Collision) => void)[]
    } = {
            click: [],
            hover: []
        }

    constructor(map: Map | EditMenu) {
        this.map = map;

        this.map.canvas.addEventListener("mousedown", (event) => {
            event.preventDefault();
            this.map.canvas.focus();

            this.map.controller.mouseX = event.offsetX;
            this.map.controller.mouseY = event.offsetY;
            this.map.controller.mouseDown = true;

            this.collisions.activeMouseCollisions = this.collisions.potentialCollisions.filter(collision => {
                return collision.x <= this.map.controller.mouseX &&
                    collision.x + collision.width >= this.map.controller.mouseX &&
                    collision.y <= this.map.controller.mouseY &&
                    collision.y + collision.height >= this.map.controller.mouseY;
            });
        });

        this.map.canvas.addEventListener("mousemove", (event) => {
            event.preventDefault();

            this.map.controller.mouseX = event.offsetX;
            this.map.controller.mouseY = event.offsetY;

            if (this.map.controller.mouseDown) {
                this.collisions.activeMouseCollisions = this.collisions.potentialCollisions.filter(collision => {
                    return collision.x <= this.map.controller.mouseX &&
                        collision.x + collision.width >= this.map.controller.mouseX &&
                        collision.y <= this.map.controller.mouseY &&
                        collision.y + collision.height >= this.map.controller.mouseY;
                });
            }

            this.collisions.activeMouseHoverCollisions = this.collisions.potentialCollisions.filter(collision => {
                return collision.x <= this.map.controller.mouseX &&
                    collision.x + collision.width >= this.map.controller.mouseX &&
                    collision.y <= this.map.controller.mouseY &&
                    collision.y + collision.height >= this.map.controller.mouseY;
            })

            for (const collision of this.collisions.activeMouseHoverCollisions) {
                for (const listener of this.listeners.hover) {
                    listener(collision);
                }
            }

            if (this.collisions.activeMouseHoverCollisions.length === 0) {
                for (const listener of this.listeners.hover) {
                    listener({
                        x: -1,
                        y: -1,
                        width: 0,
                        height: 0,
                        cellIndex: -1
                    });
                }
            }
        });

        this.map.canvas.addEventListener("mouseup", (event) => {
            event.preventDefault();

            this.map.controller.mouseX = event.offsetX;
            this.map.controller.mouseY = event.offsetY;
            this.map.controller.mouseDown = false;

            for (const collision of this.collisions.activeMouseCollisions) {
                for (const listener of this.listeners.click) {
                    listener(collision);
                }
            }

            this.collisions.activeMouseCollisions = [];
        });
    }

    addEventListener(type: "click" | "hover", callback: (collision: Collision) => void) {
        if (type in this.listeners) {
            this.listeners[type].push(callback);
        } else {
            throw new Error(`Invalid event type: ${type}`);
        }
    }

    registerPotentialCollisions(collisions: Collision[]) {
        this.collisions.potentialCollisions = collisions;

        if (this.map.controller.mouseDown) {
            this.collisions.activeMouseCollisions = this.collisions.potentialCollisions.filter(collision => {
                return collision.x <= this.map.controller.mouseX &&
                    collision.x + collision.width >= this.map.controller.mouseX &&
                    collision.y <= this.map.controller.mouseY &&
                    collision.y + collision.height >= this.map.controller.mouseY;
            });
        }
    }
}

class Map {
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

        for (let i = 0; i < input.objects.length; i++) {
            const cell = input.objects[i];

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
            objects: processedObjects,
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
                const cell = this.mapLayout.objects[cellIndex];

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
        const cell = this.mapLayout.objects[cellIndex];

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