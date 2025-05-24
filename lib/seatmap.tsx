"use client";

import { useEffect } from "react";

export default function Seatmap({ className }: { className: string }) {
    useEffect(() => {
        const map = new Map("edit", "seatmap_area", {
            x: 76,
            y: 33,
            objects: [
                { id: "1", name: "1", type: "seat", styleOverride: {} },
                { id: "2", name: "2", type: "seat", styleOverride: {} },
                { id: "3", name: "3", type: "seat", styleOverride: {} },
                { id: "4", name: "4", type: "seat", styleOverride: {} },
                { id: "1", name: "1", type: "seat", styleOverride: {} },
                { id: "2", name: "2", type: "seat", styleOverride: {} },
                { id: "3", name: "3", type: "seat", styleOverride: {} },
                { id: "4", name: "4", type: "seat", styleOverride: {} },
                { id: "1", name: "1", type: "seat", styleOverride: {} },
                { id: "2", name: "2", type: "seat", styleOverride: {} },
                { id: "3", name: "3", type: "seat", styleOverride: {} },
                { id: "4", name: "4", type: "seat", styleOverride: {} }
            ]
        });
    })
    return (
        <canvas tabIndex={1} className={className} id="seatmap_area">
            test
        </canvas>
    );
}

const CELL_SIZE = 25; // Size of each cell in pixels
const MAX_ZOOM = 6; // Maximum zoom level
const MIN_ZOOM = 0.8; // Minimum zoom level
const ZOOM_LEVELS = [0.8, 1, 1.2, 1.5, 2, 3, 4, 5, 6]; // Predefined zoom levels

export type Cell = {
    id: string;
    name: string;
    type: "seat" | "aisle" | "wall" | "door" | "custom";
    styleOverride: {
        backgroundColor?: string;
        borderColor?: string;
        borderWidth?: number;
        text?: string;
    }
} | null;

export type MapLayout = {
    x: number;
    y: number;
    objects: Cell[];
};

export type MapMode = "view" | "edit";

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

    ongoingTouches: { identifier: number, pageX: number, pageY: number }[] = [];

    constructor(mode: MapMode, canvasId: string, mapLayout: MapLayout) {
        this.mode = mode;

        this.mapLayout = mapLayout;
        this.mapWidth = mapLayout.x * CELL_SIZE;
        this.mapHeight = mapLayout.y * CELL_SIZE;

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.ctx = this.canvas.getContext("2d");

        this.render();

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
            switch (event.key) {
                case "ArrowUp":
                    this.camera.y -= 10;
                    break;
                case "ArrowDown":
                    this.camera.y += 10;
                    break;
                case "ArrowLeft":
                    this.camera.x -= 10;
                    break;
                case "ArrowRight":
                    this.camera.x += 10;
                    break;
            }

            this.keepCameraConstraints();
        });

        this.canvas.addEventListener("touchstart", this.handleTouchStartDecorator(() => this));
        this.canvas.addEventListener("touchend", this.handleTouchEndDecorator(() => this));
        this.canvas.addEventListener("touchcancel", this.handleTouchCancelDecorator(() => this));
        this.canvas.addEventListener("touchmove", this.handleTouchMoveDecorator(() => this));
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

    keepCameraConstraints() {
        const mapHeight = Math.floor(this.canvas.height / CELL_SIZE) * CELL_SIZE;
        const mapWidth = Math.floor(this.canvas.width / CELL_SIZE) * CELL_SIZE;

        if (this.camera.y > ((this.mapHeight / 2) * this.camera.zoom)) {
            this.camera.y = (this.mapHeight / 2) * this.camera.zoom;
        } else if (this.camera.y < (0 - ((this.mapHeight / 2) * this.camera.zoom))) {
            this.camera.y = 0 - ((this.mapHeight / 2) * this.camera.zoom);
        }

        if (this.camera.x > ((this.mapWidth / 2) * this.camera.zoom)) {
            this.camera.x = (this.mapWidth / 2) * this.camera.zoom;
        } else if (this.camera.x < (0 - ((this.mapWidth / 2) * this.camera.zoom))) {
            this.camera.x = 0 - ((this.mapWidth / 2) * this.camera.zoom);
        }

        this.render();
    }

    render() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // if (this.mode === "edit") {
        //     const cellSize = CELL_SIZE * this.camera.zoom;
        //     const amountX = Math.ceil(this.canvas.width / cellSize) + 1;
        //     const amountY = Math.ceil(this.canvas.height / cellSize) + 1;

        //     for (let i = 0; i < amountY; i++) {
        //         for (let j = 0; j < amountX; j++) {
        //             const x = j * cellSize + (this.canvas.width - amountX * cellSize) / 2;
        //             const y = i * cellSize + (this.canvas.height - amountY * cellSize) / 2;

        //             this.ctx.strokeStyle = "#CCC";
        //             this.ctx.lineWidth = 0.5;
        //             this.ctx.strokeRect(x, y, cellSize, cellSize);
        //         }
        //     }
        // }

        // const renderedCellSize = CELL_SIZE * this.camera.zoom;

        // const offsetX = this.camera.x * this.camera.zoom;
        // const offsetY = this.camera.y * this.camera.zoom;
        // const marginX = (this.canvas.width - this.mapWidth * this.camera.zoom) / 2 + offsetX;
        // const marginY = (this.canvas.height - this.mapHeight * this.camera.zoom) / 2 + offsetY;

        // const amountAbove = Math.ceil(this.canvas.height / renderedCellSize);
        // const amountLeft = Math.ceil(this.canvas.width / renderedCellSize);

        // const cellsY = ((amountAbove * 2) + this.mapLayout.y);
        // const cellsX = ((amountLeft * 2) + this.mapLayout.x);

        // for (let i = 0; i < cellsY; i++) {
        //     for (let j = 0; j < cellsX; j++) {
        //         if (this.mode === "edit" && ((i <= amountAbove || i >= this.mapLayout.y + amountAbove) || (j <= amountLeft || j >= this.mapLayout.x + amountLeft))) {
        //             const y = i * renderedCellSize + (this.canvas.height - cellsX * renderedCellSize) / 2;
        //             const x = j * renderedCellSize + (this.canvas.width - cellsY * renderedCellSize) / 2;

        //             this.ctx.strokeStyle = "#CCC";
        //             this.ctx.lineWidth = 0.5;
        //             this.ctx.strokeRect(x, y, renderedCellSize, renderedCellSize);

        //             continue;
        //         }

        //         const cell = this.mapLayout.objects[(i - amountAbove) * this.mapLayout.x + (j - amountLeft)];
        //         const cellStyle = this.getCellStyle(cell);

        //         const x = j * renderedCellSize + marginX;
        //         const y = i * renderedCellSize + marginY;

        //         this.ctx.strokeStyle = cellStyle.borderColor;
        //         this.ctx.lineWidth = cellStyle.borderWidth * this.camera.zoom;
        //         this.ctx.strokeRect(x, y, renderedCellSize, renderedCellSize);

        //         this.ctx.fillStyle = cellStyle.backgroundColor;
        //         this.ctx.fillRect(x, y, renderedCellSize, renderedCellSize);
        //     }
        // }

        const renderedCellSize = CELL_SIZE * this.camera.zoom;

        const columnsAmount = this.mapLayout.x;
        const rowsAmount = this.mapLayout.y;

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
            if (this.mode === "edit") {
                const xPos = -(renderedCellSize - marginX) + x * renderedCellSize - this.camera.x;
                const yPos = -(renderedCellSize - marginY) - this.camera.y;

                this.ctx.strokeStyle = "#0FF";
                this.ctx.lineWidth = 0.5 * this.camera.zoom;
                this.ctx.strokeRect(xPos, yPos, renderedCellSize, renderedCellSize);

                const yPos2 = -(renderedCellSize - marginY) - this.camera.y + renderedCellSize * (rowsAmount + 1);

                this.ctx.strokeStyle = "#0FF";
                this.ctx.lineWidth = 0.5 * this.camera.zoom;
                this.ctx.strokeRect(xPos, yPos2, renderedCellSize, renderedCellSize);
            }
        }

        for (let y = 0; y < (rowsAmount); y++) {
            if (this.mode === "edit") {
                const xPos = -(renderedCellSize - marginX) - this.camera.x;
                const yPos = -(renderedCellSize - marginY) + y * renderedCellSize - this.camera.y + renderedCellSize;

                this.ctx.strokeStyle = "#0FF";
                this.ctx.lineWidth = 0.5 * this.camera.zoom;
                this.ctx.strokeRect(xPos, yPos, renderedCellSize, renderedCellSize);

                const xPos2 = -(renderedCellSize - marginX) - this.camera.x + renderedCellSize * (columnsAmount + 1);

                this.ctx.strokeStyle = "#0FF";
                this.ctx.lineWidth = 0.5 * this.camera.zoom;
                this.ctx.strokeRect(xPos2, yPos, renderedCellSize, renderedCellSize);
            }

            for (let x = 0; x < columnsAmount; x++) {
                const cellIndex = y * columnsAmount + x;
                const cell = this.mapLayout.objects[cellIndex];

                if (!cell) {
                    if (this.mode === "edit") {
                        const xPos = x * renderedCellSize + marginX - this.camera.x;
                        const yPos = y * renderedCellSize + marginY - this.camera.y;

                        this.ctx.strokeStyle = "#CCC";
                        this.ctx.lineWidth = 0.5 * this.camera.zoom;
                        this.ctx.strokeRect(xPos, yPos, renderedCellSize, renderedCellSize);
                    }
                    continue;
                };

                const cellStyle = this.getCellStyle(cell);

                const xPos = x * renderedCellSize + marginX - this.camera.x;
                const yPos = y * renderedCellSize + marginY - this.camera.y;

                // Check if the cell is within the visible window adjusted for zoom
                if (xPos + renderedCellSize < -visibleWindowTolerance.x || xPos > this.canvas.width + visibleWindowTolerance.x ||
                    yPos + renderedCellSize < -visibleWindowTolerance.y || yPos > this.canvas.height + visibleWindowTolerance.y) {
                    continue;
                }

                this.ctx.strokeStyle = cellStyle.borderColor;
                this.ctx.lineWidth = cellStyle.borderWidth * this.camera.zoom;
                this.ctx.strokeRect(xPos, yPos, renderedCellSize, renderedCellSize);

                this.ctx.fillStyle = cellStyle.backgroundColor;
                this.ctx.fillRect(xPos, yPos, renderedCellSize, renderedCellSize);

                if (cellStyle.text) {
                    this.ctx.fillStyle = "#000";
                    this.ctx.font = `${12 * this.camera.zoom}px Arial`;
                    this.ctx.fillText(cellStyle.text, xPos + 5, yPos + 15);
                }
            }
        }
    }

    getCellStyle(cell: Cell): { backgroundColor: string, borderColor: string, borderWidth: number, text: string } {
        let style = {
            backgroundColor: "#FFF",
            borderColor: "#000",
            borderWidth: 1,
            text: ""
        }

        if (cell === null) {
            return style; // Return default style for empty cells, though this won't happen normally
        }

        if (cell.type === "seat") {
            style.backgroundColor = "#0F0"; // Default seat color
            style.borderColor = "#000"; // Default border color
            style.borderWidth = 1; // Default border width
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