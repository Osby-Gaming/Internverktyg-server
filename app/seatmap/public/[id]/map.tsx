"use client";

import { Cell, MapLayoutInput } from "@/lib/seatmap/types";
import SeatMap from "@/lib/seatmap/Map";
import { useEffect, useState } from "react";
import { claimSeat, getMapLayout } from "./actions";

export default function Map({ mapLayout, id, accessKey, claimedSeats }: { mapLayout: MapLayoutInput, id: string, accessKey?: string, claimedSeats: number[] }) {
    const [selectedSeat, setSelectedSeat] = useState<{
        index: number;
        cell: Cell;
    }>({
        index: -1,
        cell: null
    });

    const [map, setMap] = useState<SeatMap | null>(null);

    const [claimed, setClaimed] = useState<number[]>(claimedSeats);

    useEffect(() => {
        const map = new SeatMap("view", "seatmap_area", mapLayout);

        map.on("select", (i) => {
            setSelectedSeat({
                index: i,
                // @ts-expect-error
                cell: { ...map.mapLayout.cells[i] || null }
            });
        });

        setMap(map);
    }, []);

    return (
        <div className="relative h-[calc(100%-5rem)] w-full">
            <canvas tabIndex={1} className={"w-full h-full" + " focus:outline-none"} id="seatmap_area">
                Javascript is required to render the seatmap.
            </canvas>
            {(accessKey && selectedSeat.cell?.type === "seat" && map ?
                <div className="flex flex-col items-center justify-center absolute bottom-0 w-full h-64 pointer-events-none">
                    <div className="bg-[#000] w-80 h-40 bg-opacity-60">
                        <div className="text-center text-sm">Om du vill ändra plats, klicka på en annan plats på kartan.</div>
                        <div className="text-center text-sm">Om du vill avbryta, klicka på "Avbryt" nedan.</div>
                        <div className="flex justify-center mt-2">
                            <button className="px-4 py-2 rounded pointer-events-auto" disabled={claimed.includes(selectedSeat.index)} onClick={async () => {
                                const claimRes = await claimSeat(selectedSeat.index, id, accessKey);

                                if (claimRes.status === 200) {
                                    const newMapLayoutRes = await getMapLayout(id, accessKey);

                                    if (newMapLayoutRes.status === 200 && newMapLayoutRes.data) {
                                        map.switchLayout(newMapLayoutRes.data[0]);
                                        setClaimed(newMapLayoutRes.data[1]);

                                    } else {
                                        alert("Det gick inte att uppdatera kartan: " + newMapLayoutRes.message);
                                    }
                                } else {
                                    alert("Det gick inte att välja platsen: " + claimRes.message);
                                }
                            }}>Välj</button>
                        </div>
                    </div>
                </div>
                :
                '')}
        </div>
    );
}