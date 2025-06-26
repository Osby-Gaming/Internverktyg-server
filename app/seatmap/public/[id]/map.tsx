"use client";

import { MapLayoutInput } from "@/lib/seatmap/types";
import SeatMap from "@/lib/seatmap/Map";
import { useEffect, useState } from "react";

export default function Map({ mapLayout, id }: { mapLayout: MapLayoutInput, id: string }) {
    const [selectedSeat, setSelectedSeat] = useState<number>(-1);
    const [firstRender, setFirstRender] = useState<boolean>(true);
    useEffect(() => {
        if (firstRender) {
            setFirstRender(false);

            const map = new SeatMap("view", "seatmap_area", mapLayout);

            map.on("select", (i) => {
                setSelectedSeat(i);
            });
        }
    });

    return (
        <div className="relative h-[calc(100%-5rem)] w-full">
            <canvas tabIndex={1} className={"w-full h-full" + " focus:outline-none"} id="seatmap_area">
                Javascript is required to render the seatmap.
            </canvas>
            <div className="flex flex-col items-center justify-center absolute bottom-0 w-full h-64 pointer-events-none" style={{
                display: selectedSeat < 0 ? "none" : "flex"
            }}>
                <div className="bg-[#000] w-80 h-40 bg-opacity-60 pointer-events-auto">
                    <div className="text-center text-lg font-bold">Du har valt plats {selectedSeat + 1}</div>
                    <div className="text-center text-sm">Om du vill ändra plats, klicka på en annan plats på kartan.</div>
                    <div className="text-center text-sm">Om du vill avbryta, klicka på "Avbryt" nedan.</div>
                    <div className="flex justify-center mt-2">
                        <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={() => setSelectedSeat(-1)}>Avbryt</button>
                    </div>
                </div>
            </div>
        </div>
    );
}