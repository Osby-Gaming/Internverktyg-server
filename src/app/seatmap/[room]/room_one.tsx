'use client';

import { useEffect, useState } from "react";
import { getSeatAvailability } from "../actions";
import Loading from "@/lib/components/loading";

export default function RoomOne() {
    const [seatsAvailable, setSeatsAvailable] = useState<string[] | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [lastSelected, setLastSelected] = useState<string | null>(null);

    let lastClickedOutside = Date.now();

    useEffect(() => {
        (async () => {
            const seatAvailabilityReq = await getSeatAvailability();

            if (seatAvailabilityReq.data === null) {
                alert("Handle error here.");
                return;
            }

            setSeatsAvailable(seatAvailabilityReq.data.filter((seat => seat.room === "Rum 1" && !seat.taken)).map((seat) => seat.number));
        })()

        console.log(document.getElementById("seatmap_area"))

        document.getElementById("seatmap_area")?.addEventListener("click", () => {
            lastClickedOutside = Date.now();

            setSelected(null);
        }, true)
    }, [])

    function handleSelect(number: string) {
        const copyOfLastSelected = lastSelected;
        setLastSelected(number);

        if ((lastClickedOutside + 2) > Date.now() && (copyOfLastSelected === number || lastSelected === number)) {
            setSelected(null);

            return;
        }

        setSelected(number);
    }

    if (seatsAvailable !== null) return (
        <>
            <div>
                <div className="grid gap-4 grid-cols-4 grid-rows-2">
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("1") ? "bg-seatmap_green" : "bg-red-600") + (selected === "1" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("1") }}>1</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("2") ? "bg-seatmap_green" : "bg-red-600") + (selected === "2" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("2") }}>2</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("3") ? "bg-seatmap_green" : "bg-red-600") + (selected === "3" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("3") }}>3</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("4") ? "bg-seatmap_green" : "bg-red-600") + (selected === "4" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("4") }}>4</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("5") ? "bg-seatmap_green" : "bg-red-600") + (selected === "5" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("5") }}>5</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("6") ? "bg-seatmap_green" : "bg-red-600") + (selected === "6" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("6") }}>6</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("7") ? "bg-seatmap_green" : "bg-red-600") + (selected === "7" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("7") }}>7</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("8") ? "bg-seatmap_green" : "bg-red-600") + (selected === "8" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("8") }}>8</div>
                </div>
                <div className="h-24">

                </div>
                <div className="grid gap-4 grid-cols-4 grid-rows-2">
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("9") ? "bg-seatmap_green" : "bg-red-600") + (selected === "9" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("9") }}>9</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("10") ? "bg-seatmap_green" : "bg-red-600") + (selected === "10" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("10") }}>10</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("11") ? "bg-seatmap_green" : "bg-red-600") + (selected === "11" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("11") }}>11</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("12") ? "bg-seatmap_green" : "bg-red-600") + (selected === "12" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("12") }}>12</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("13") ? "bg-seatmap_green" : "bg-red-600") + (selected === "13" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("13") }}>13</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("14") ? "bg-seatmap_green" : "bg-red-600") + (selected === "14" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("14") }}>14</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("15") ? "bg-seatmap_green" : "bg-red-600") + (selected === "15" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("15") }}>15</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (seatsAvailable.includes("16") ? "bg-seatmap_green" : "bg-red-600") + (selected === "16" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} onClick={(e) => { e.stopPropagation(); handleSelect("16") }}>16</div>
                </div>
            </div>
            <div className={"absolute bottom-10 h-20 w-[40%] bg-[#262626] py-6 px-8 items-center " + (selected === null ? "hidden" : "flex")} onClick={e => e.stopPropagation()}>
                {selected ? (
                    <>
                        <p className="w-[80%] text-3xl h-fit">
                            {seatsAvailable.includes(selected) ? "Platsen är ledig!" : "Platsen är redan upptagen!"}
                        </p>
                        <div className="w-[20%] p-2">
                            <button>Claim</button>
                        </div>
                    </>
                ) : ""}
            </div>
        </>
    ); else {
        return Loading();
    }
}
