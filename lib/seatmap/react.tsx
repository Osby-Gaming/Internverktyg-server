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