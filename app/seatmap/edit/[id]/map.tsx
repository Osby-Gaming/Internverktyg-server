"use client";

import { MapLayoutInput } from "@/lib/seatmap/types";
import SeatMap from "@/lib/seatmap/Map";
import { useEffect } from "react";

export default function Map({ mapLayout }: { mapLayout: MapLayoutInput }) {
    useEffect(() => {
        const map = new SeatMap("edit", "seatmap_area", mapLayout, "edit_menu");
        
        map.on("save", (data) => {
            console.log("Map saved:", data);
        })
    })

    return (
        <>
            <canvas tabIndex={1} className={"w-full h-[calc(100%-5rem)]" + " focus:outline-none"} id="seatmap_area">
                Javascript is required to render the seatmap.
            </canvas>
            <div className={"absolute bottom-0 right-0 bg-[rgba(0,0,0,0.6)] hidden " + "w-80 h-[calc(100%-5rem)]"} id="edit_menu">
                <input tabIndex={2} type="text" className="opacity-0 w-0 h-0 p-0" />
                <canvas tabIndex={3} className="w-full h-full absolute bottom-0 right-0 focus:outline-none"></canvas>
            </div>
        </>
    );
}