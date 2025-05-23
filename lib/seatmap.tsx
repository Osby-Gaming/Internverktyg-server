"use client";

import { useEffect } from "react";

export default function Seatmap({ className }: { className: string }) {
    useEffect(() => {
        const map = new Map("seatmap_area", {
            x: 4,
            y: 3,
            objects: [
                { id: "1", name: "1", type: "seat" },
                { id: "2", name: "2", type: "seat" },
                { id: "3", name: "3", type: "seat" },
                { id: "4", name: "4", type: "seat" },
                { id: "1", name: "1", type: "seat" },
                { id: "2", name: "2", type: "seat" },
                { id: "3", name: "3", type: "seat" },
                { id: "4", name: "4", type: "seat" },
                { id: "1", name: "1", type: "seat" },
                { id: "2", name: "2", type: "seat" },
                { id: "3", name: "3", type: "seat" },
                { id: "4", name: "4", type: "seat" }
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

export type MapLayout = {
    x: number;
    y: number;
    objects: {
        id: string;
        name: string;
        type: "seat" | "aisle" | "wall" | "door";
    }[];
};

class Map {
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

    constructor(canvasId: string, mapLayout: MapLayout) {
        this.mapLayout = mapLayout;
        this.mapWidth = mapLayout.x * CELL_SIZE;
        this.mapHeight = mapLayout.y * CELL_SIZE;

        this.canvas = document.getElementById(canvasId) as HTMLCanvasElement;
        this.canvas.width = this.canvas.offsetWidth;
        this.canvas.height = this.canvas.offsetHeight;

        this.ctx = this.canvas.getContext("2d");

        this.render();

        this.canvas.addEventListener("wheel", (event) => {
            this.camera.zoom += event.deltaY * -0.01;

            // Restrict scale
            this.camera.zoom = Math.min(Math.max(0.5, this.camera.zoom), 6);

            this.render();
        });

        this.canvas.addEventListener("keydown", (event) => {
            console.log(this.camera)
            switch (event.key) {
                case "ArrowUp":
                    this.camera.y += 10;
                    this.camera.y = Math.min(Math.max((this.canvas.height - this.mapHeight * this.camera.zoom)/2, this.camera.y), 0);
                    break;
                case "ArrowDown":
                    this.camera.y -= 10;
                    this.camera.y = Math.min(Math.max(this.canvas.height - this.mapHeight * this.camera.zoom, this.camera.y), 0);
                    break;
                case "ArrowLeft":
                    this.camera.x += 10;
                    this.camera.x = Math.min(Math.max(this.canvas.width - this.mapWidth * this.camera.zoom, this.camera.x), 0);
                    break;
                case "ArrowRight":
                    this.camera.x -= 10;
                    this.camera.x = Math.min(Math.max(this.canvas.width - this.mapWidth * this.camera.zoom, this.camera.x), 0);
                    break;
            }

            this.render();
        });

    }

    render() {
        if (!this.ctx) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const offsetX = this.camera.x * this.camera.zoom;
        const offsetY = this.camera.y * this.camera.zoom;
        const marginX = (this.canvas.width - this.mapWidth * this.camera.zoom) / 2 + offsetX;
        const marginY = (this.canvas.height - this.mapHeight * this.camera.zoom) / 2 + offsetY;

        for (let i = 0; i < this.mapLayout.y; i++) {
            for (let j = 0; j < this.mapLayout.x; j++) {
                const x = j * CELL_SIZE * this.camera.zoom + marginX;
                const y = i * CELL_SIZE * this.camera.zoom + marginY;

                this.ctx.strokeStyle = "black";
                this.ctx.lineWidth = 1;
                this.ctx.strokeRect(x, y, CELL_SIZE * this.camera.zoom, CELL_SIZE * this.camera.zoom);

                this.ctx.fillStyle = "white";
                this.ctx.fillRect(x, y, CELL_SIZE * this.camera.zoom, CELL_SIZE * this.camera.zoom);
            }
        }
    }
}