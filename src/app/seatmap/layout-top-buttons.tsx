'use client';

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";


export default function LayoutTopButtons() {
    let room = 2;
    const params = useParams();
    const search = useSearchParams();

    if (params["room"] && typeof params["room"] === 'string') {
        room = parseInt(params["room"]);
    }

    const access = search.get("access");
    let addedSearch = "";
    if (search.get("access") !== null) {
        addedSearch = `?access=${access}`;
    }

    return (
        <>
            <Link href={"/seatmap/0" + addedSearch}><button className={"rounded-none h-[45%] text-black py-1.5 px-8 mr-4" + (room === 0 ? " opacity-100 hover:opacity-90" : " opacity-70 hover:opacity-60")}>Rum 1</button></Link>
            <Link href={"/seatmap/1" + addedSearch}><button className={"rounded-none h-[45%] text-black py-1.5 px-8" + (room === 1 ? " opacity-100 hover:opacity-90" : " opacity-70 hover:opacity-60")}>Rum 2</button></Link>
        </>
    )
}