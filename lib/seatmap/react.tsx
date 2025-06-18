"use client";

import { useEffect } from "react";

import Map from "./Map";

export default function Seatmap({ className, editMenuClassName }: { className: string, editMenuClassName: string }) {
    useEffect(() => {
        const map = new Map("edit", "seatmap_area", {
            x: 76,
            y: 33,
            cells: [
                "1000",
                { name: "1", type: "seat" },
                { name: "2", type: "aisle" },
                { name: "3", type: "wall" },
                { name: "4", type: "door" },
                { name: "1", type: "custom" },
                { name: "2", type: "seat" },
                { name: "3", type: "aisle" },
                { name: "4", type: "wall" },
                { name: "1", type: "door" },
                { name: "2", type: "custom" },
                { name: "3", type: "seat" },
                { name: "4", type: "aisle" },
                "1496"
            ]
        }, "edit_menu");
    })
    return (
        <>
            <canvas tabIndex={1} className={className + " focus:outline-none"} id="seatmap_area">
                Javascript is required to render the seatmap.
            </canvas>
            <div className={"absolute bottom-0 right-0 bg-[rgba(0,0,0,0.6)] hidden " + editMenuClassName} id="edit_menu">
                <input tabIndex={2} type="text" className="opacity-0 w-0 h-0 p-0" />
                <canvas tabIndex={3} className="w-full h-full absolute bottom-0 right-0 focus:outline-none"></canvas>
            </div>
        </>
    );
}