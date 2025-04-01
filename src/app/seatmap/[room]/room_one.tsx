'use client';

import { useEffect, useState } from "react";
import { claimSeat, getSeatAvailability } from "../actions";
import Loading from "@/lib/components/loading";
import { useSearchParams } from "next/navigation";

const ROOM_NAME = "Rum 1";

export default function RoomOne() {
    const [seatsAvailable, setSeatsAvailable] = useState<string[] | null>(null);
    const [selected, setSelected] = useState<string | null>(null);
    const [lastSelected, setLastSelected] = useState<string | null>(null);

    const searchParams = useSearchParams();
    const accessKey = searchParams.get('access');

    const [lastClickedOutside, setLastClickedOutside] = useState(Date.now());
    const [lastClickedClaimButton, setLastClickedClaimButton] = useState(Date.now());

    const [seatTakenByUser, setSeatTakenByUser] = useState<string | null>(null);
    const [seatTakenByUserRoom, setSeatTakenByUserRoom] = useState<string | null>(null);

    const [claimButtonContent, setClaimButtonContent] = useState<any>("Claim");

    async function loadSeats() {
        const seatAvailabilityReq = await getSeatAvailability(accessKey ?? undefined);

        if (seatAvailabilityReq.data === null) {
            setSeatTakenByUserRoom(null);
            setSeatTakenByUser(null);
            setSeatsAvailable(null);

            console.log(seatAvailabilityReq);
            alert("Handle error here.");
            return;
        }

        setSeatTakenByUserRoom(seatAvailabilityReq.data.find((seat) => seat.thisUser)?.room ?? null);

        setSeatTakenByUser(seatAvailabilityReq.data.find((seat) => seat.thisUser)?.number ?? null);

        setSeatsAvailable(seatAvailabilityReq.data.filter((seat => seat.room === ROOM_NAME && !seat.taken)).map((seat) => seat.number));
    }

    useEffect(() => {
        loadSeats();

        document.getElementById("seatmap_area")?.addEventListener("click", () => {
            setLastClickedOutside(Date.now());

            if ((lastClickedClaimButton + 2) < lastClickedOutside) {
                setSelected(null);
            }
        }, true)
    }, [])

    function handleSelect(number: string) {
        const copyOfLastSelected = lastSelected;
        setLastSelected(number);

        if ((lastClickedOutside + 2) > Date.now() && (copyOfLastSelected === number || lastSelected === number)) {
            setSelected(null);

            setLastSelected(null);

            return;
        }

        setSelected(number);
    }

    function getSeatStyle(number: string) {
        if (seatTakenByUser === number && seatTakenByUserRoom === ROOM_NAME) return {
            backgroundColor: "#0000FF"
        };
        if (seatsAvailable && seatsAvailable.includes(number)) return {
            backgroundColor: "#43FFC9"
        };
        return {
            backgroundColor: "rgb(220 38 38 / var(--tw-bg-opacity, 1))"
        }
    }

    if (seatsAvailable !== null) return (
        <>
            <div>
                <div className="grid gap-4 grid-cols-4 grid-rows-2">
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "1" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("1")} onClick={(e) => { e.stopPropagation(); handleSelect("1") }}>1</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "2" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("2")} onClick={(e) => { e.stopPropagation(); handleSelect("2") }}>2</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "3" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("3")} onClick={(e) => { e.stopPropagation(); handleSelect("3") }}>3</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "4" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("4")} onClick={(e) => { e.stopPropagation(); handleSelect("4") }}>4</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "5" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("5")} onClick={(e) => { e.stopPropagation(); handleSelect("5") }}>5</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "6" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("6")} onClick={(e) => { e.stopPropagation(); handleSelect("6") }}>6</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "7" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("7")} onClick={(e) => { e.stopPropagation(); handleSelect("7") }}>7</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "8" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("8")} onClick={(e) => { e.stopPropagation(); handleSelect("8") }}>8</div>
                </div>
                <div className="h-24">

                </div>
                <div className="grid gap-4 grid-cols-4 grid-rows-2">
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "9" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("9")} onClick={(e) => { e.stopPropagation(); handleSelect("9") }}>9</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "10" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("10")} onClick={(e) => { e.stopPropagation(); handleSelect("10") }}>10</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "11" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("11")} onClick={(e) => { e.stopPropagation(); handleSelect("11") }}>11</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "12" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("12")} onClick={(e) => { e.stopPropagation(); handleSelect("12") }}>12</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "13" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("13")} onClick={(e) => { e.stopPropagation(); handleSelect("13") }}>13</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "14" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("14")} onClick={(e) => { e.stopPropagation(); handleSelect("14") }}>14</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "15" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("15")} onClick={(e) => { e.stopPropagation(); handleSelect("15") }}>15</div>
                    <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none duration-200 " + (selected === "16" ? " scale-125 hover:scale-125" : " scale-100 hover:scale-110")} style={getSeatStyle("16")} onClick={(e) => { e.stopPropagation(); handleSelect("16") }}>16</div>
                </div>
            </div>
            <div className={"absolute bottom-10 h-20 w-[40%] bg-[#262626] py-6 px-8 items-center " + (selected === null ? "hidden" : "flex")} onClick={e => e.stopPropagation()}>
                {selected ? (
                    <>
                        <p className="w-[80%] text-3xl h-fit select-none">
                            {seatsAvailable.includes(selected) ? "Platsen är ledig!" : "Platsen är redan upptagen!"}
                        </p>
                        <div className="w-[20%] p-2">
                            <button onClick={async () => {
                                setLastClickedClaimButton(Date.now());

                                if (accessKey) {
                                    setClaimButtonContent(<Loading></Loading>);

                                    console.log(await claimSeat(accessKey, selected));

                                    await loadSeats();

                                    setClaimButtonContent("Claim");
                                } else {
                                    return alert("Handle error here with claim");
                                }
                            }}>{claimButtonContent}</button>
                        </div>
                    </>
                ) : ""}
            </div>
        </>
    ); else {
        return Loading();
    }
}
