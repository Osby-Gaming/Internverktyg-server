"use client";

import { MapLayoutInput } from "@/lib/seatmap/types";
import SeatMap from "@/lib/seatmap/Map";
import { useEffect } from "react";
import { createMap, updateMap } from "./actions";
import { useRouter } from "next/navigation";

export default function Map({ mapLayout, id, lockedCells }: { mapLayout: MapLayoutInput, id: string, lockedCells: number[] }) {
    const router = useRouter();

    useEffect(() => {
        const map = new SeatMap("edit", "seatmap_area", mapLayout, "edit_menu", "toolbelt", lockedCells);
        
        map.on("save", async (data) => {
            if (id === "new") {
                const mapResult = await createMap(data, "Nytt rum");

                if (mapResult.data === null) {
                    // TODO
                    alert("Failed to create map: " + mapResult.message);
                    return;
                }

                router.push(`/seatmap/edit/${mapResult.data.$id}`);
            } else {
                const mapResult = await updateMap(data, id, "Uppdaterat rum"); 
                
                if (mapResult.data === null) {
                    // TODO
                    alert("Failed to update map: " + mapResult.message);
                    return;
                }
            }
        })
    }, [])

    return (
        <>
            <canvas tabIndex={1} className={"w-full h-[calc(100%-5rem)]" + " focus:outline-none"} id="seatmap_area">
                Javascript is required to render the seatmap.
            </canvas>
            <div className={"absolute bottom-[3rem] right-0 bg-[rgba(0,0,0,0.6)] hidden w-80 h-[calc(100%-5rem-3rem)]"} id="edit_menu">
                <input tabIndex={2} type="text" className="opacity-0 w-0 h-0 p-0" />
                <canvas tabIndex={3} className="w-full h-full absolute bottom-0 right-0 focus:outline-none"></canvas>
            </div>
            <div className="absolute bottom-0 right-0 left-0 h-12">
                <div id="toolbelt" className="flex flex-row justify-end items-center bg-[rgba(0,0,0,0.6)] h-12 px-4">
                    <button id="generate-labels" className="btn btn-primary mr-2">Generera platsnummer</button>
                    <button id="delete-cells" className="btn btn-success mr-2">Radera markering</button>
                </div>
            </div>
        </>
    );
}