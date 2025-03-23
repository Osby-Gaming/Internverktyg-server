'use client';

import Link from "next/link";
import { useParams } from "next/navigation";


export default function LayoutTopButtons() {
    let room = 2;
    const params = useParams();

    if (params["room"] && typeof params["room"] === 'string') {
        room = parseInt(params["room"]);
    }

    return (
        <>
            <Link href="/seatmap/0"><button className={"rounded-none h-[45%] text-black py-1.5 px-8 mr-4" + (room === 0 ? " opacity-100 hover:opacity-90" : " opacity-70 hover:opacity-60")}>Rum 1</button></Link>
            <Link href="/seatmap/1"><button className={"rounded-none h-[45%] text-black py-1.5 px-8" + (room === 1 ? " opacity-100 hover:opacity-90" : " opacity-70 hover:opacity-60")}>Rum 2</button></Link>
        </>
    )
}