'use client'

import { Models } from "appwrite";
import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function Item({ data, onClick }: { data: Models.Document, onClick: () => void }) {
    return (
        <div>
            <div className="w-[13rem] h-[18rem]">
                <button className="relative w-full h-[13rem] flex justify-center items-center bg-kiosk_item_background rounded-3xl shadow-xl select-none">
                    <img src={data.thumbnail_url} alt={data.name} className="object-scale-down w-[11rem] h-[11rem]" />
                    <p className="absolute font-bold text-lg bottom-0 bg-[#151515] text-center w-full py-0.5 rounded-3xl">
                        {data.price} kr
                    </p>
                    <div className="absolute h-full w-full bg-green-600 opacity-0 hover:opacity-85 rounded-3xl flex justify-center items-center" onClick={onClick}>
                        <FontAwesomeIcon icon={faSquarePlus} size="3x" />
                    </div>
                </button>
                <p className="text-center text-xl font-semibold mt-4">{data.name}</p>
            </div>
        </div>
    )
}