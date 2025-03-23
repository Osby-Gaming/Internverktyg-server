import { getSeatAvailability } from "../actions";

export default async function RoomOne() {
    const seatAvailabilityReq = await getSeatAvailability();

    if (seatAvailabilityReq.data === null) {
        return (
            <p>Error</p>
        );
    }

    const seatsAvailable = seatAvailabilityReq.data.filter((seat => seat.room === "Rum 1" && !seat.taken)).map((seat) => seat.number);

    return (
        <div>
            <div className="grid gap-4 grid-cols-4 grid-rows-2">
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("1") ? "bg-seatmap_green" : "bg-red-600")}>1</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("2") ? "bg-seatmap_green" : "bg-red-600")}>2</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("3") ? "bg-seatmap_green" : "bg-red-600")}>3</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("4") ? "bg-seatmap_green" : "bg-red-600")}>4</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("5") ? "bg-seatmap_green" : "bg-red-600")}>5</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("6") ? "bg-seatmap_green" : "bg-red-600")}>6</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("7") ? "bg-seatmap_green" : "bg-red-600")}>7</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("8") ? "bg-seatmap_green" : "bg-red-600")}>8</div>
            </div>
            <div className="h-24">

            </div>
            <div className="grid gap-4 grid-cols-4 grid-rows-2">
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("9") ? "bg-seatmap_green" : "bg-red-600")}>9</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("10") ? "bg-seatmap_green" : "bg-red-600")}>10</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("11") ? "bg-seatmap_green" : "bg-red-600")}>11</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("12") ? "bg-seatmap_green" : "bg-red-600")}>12</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("13") ? "bg-seatmap_green" : "bg-red-600")}>13</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("14") ? "bg-seatmap_green" : "bg-red-600")}>14</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("15") ? "bg-seatmap_green" : "bg-red-600")}>15</div>
                <div className={"w-16 h-16 text-black text-2xl flex justify-center items-center select-none hover:scale-125 duration-200 " + (seatsAvailable.includes("16") ? "bg-seatmap_green" : "bg-red-600")}>16</div>
            </div>
        </div>
    );
}
