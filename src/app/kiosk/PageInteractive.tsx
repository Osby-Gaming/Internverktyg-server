'use client';

import { useEffect, useState } from "react";
import ItemGrid from "./ItemGrid";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { getWristband } from "@/lib/appwrite_client";
import { CartData, CheckoutItem } from "@/lib/types";
import { useRouter } from "next/navigation";

export default function Page() {
    const [checkoutItems, setCheckoutItems] = useState<Record<string, CheckoutItem>>({});
    const [wristbandNumber, setWristbandNumber] = useState<number | undefined>(undefined);
    const [error, setError] = useState('');

    const router = useRouter();

    return (
        <>
            <div className="flex">
                <div className="w-[58vw] height-[65vh]">
                    <div className="min-h-[65vh] overflow-x-scroll whitespace-nowrap overflow-visible">
                        <ItemGrid handleAdd={(item) => {
                            const checkoutItemsCopy = { ...checkoutItems };

                            if (checkoutItemsCopy[item.$id] && checkoutItemsCopy[item.$id].stock !== checkoutItemsCopy[item.$id].amount) {
                                checkoutItemsCopy[item.$id].amount++;
                            } else if (checkoutItemsCopy[item.$id] && checkoutItemsCopy[item.$id].stock === checkoutItemsCopy[item.$id].amount) {
                                // Just catch the case where the amount is the same as the available stock.
                                // Without this the amount just resets to 1 after exceeding stock.
                            } else if (item.stock > 0) {
                                checkoutItemsCopy[item.$id] = { $id: item.$id, name: item.name, price: item.price, amount: 1, stock: item.stock, age_restricted_15: item.age_restricted_15 };
                            }

                            setCheckoutItems(checkoutItemsCopy);
                        }} />
                    </div>
                </div>
                <div className="w-[2vw]"></div>
                <div className="w-[30vw] height-[65vh] relative">
                    <div className="absolute z-10 w-full h-full bg-[#181818] rounded-3xl">
                        <ul>
                            {Object.keys(checkoutItems).map((i) =>
                                <li key={i} className="flex p-4">
                                    <button style={{
                                        all: 'unset'
                                    }} onClick={() => {
                                        const checkoutItemsCopy = { ...checkoutItems };

                                        if (checkoutItemsCopy[i].amount > 0) {
                                            checkoutItemsCopy[i].amount--;
                                        }

                                        if (checkoutItemsCopy[i].amount === 0) {
                                            delete checkoutItemsCopy[i];
                                        }

                                        setCheckoutItems(checkoutItemsCopy);
                                    }}>
                                        <FontAwesomeIcon icon={faMinus} size="2x" className={"mr-3 text-red-600 cursor-pointer"} />
                                    </button>
                                    <button style={{
                                        all: 'unset'
                                    }} onClick={() => {
                                        const checkoutItemsCopy = { ...checkoutItems };

                                        if (checkoutItemsCopy[i].amount < checkoutItemsCopy[i].stock) {
                                            checkoutItemsCopy[i].amount++;
                                        }

                                        if (checkoutItemsCopy[i].amount === 0) {
                                            delete checkoutItemsCopy[i];
                                        }

                                        setCheckoutItems(checkoutItemsCopy);
                                    }}>
                                        <FontAwesomeIcon icon={faPlus} size="2x" className={(checkoutItems[i].amount === checkoutItems[i].stock ? "text-teal-200 cursor-not-allowed" : "text-teal-400 cursor-pointer")} />
                                    </button>
                                </li>
                            )}
                        </ul>
                    </div>
                    <div className="absolute z-20 h-full w-[25vw] right-0 p-4 px-10 bg-[#262626] min-height-[90vh] rounded-3xl">
                        <ul className="list-disc">
                            {Object.keys(checkoutItems).map((i) =>
                                <li key={i} className="flex">
                                    <p className="w-[84%] text-ellipsis whitespace-nowrap overflow-hidden font-bold">{checkoutItems[i].amount}x {checkoutItems[i].name}</p>
                                    <p className="w-[16%] font-bold">{checkoutItems[i].price}kr</p>
                                </li>
                            )}
                        </ul>
                    </div>
                </div>
            </div>
            <div className="flex mt-10">
                <div className="w-[16%]"></div>
                <h1 className="text-5xl font-bold select-none">ARMBANDSNUMMER:</h1>
                <input type="number" className="text-4xl w-[calc(58vw-432px-16%)]" min={0} onChange={(e) => {
                    setWristbandNumber(parseInt(e.target.value));
                    setError('');
                }} />
                <div className="flex ml-auto">
                    <div className="bg-white mr-4 rounded-xl">
                        <button className="text-3xl font-bold bg-[#151515] h-12 shadow-xl" disabled={!Object.keys(checkoutItems).length} onClick={() => {
                            setCheckoutItems({});
                        }}>Återställ</button>
                    </div>
                    <div className="bg-white rounded-xl">
                        <button className="text-3xl font-bold h-12 shadow-xl" disabled={!Object.keys(checkoutItems).length} onClick={async () => {
                            if (!Object.keys(checkoutItems).length) {
                                setError("Välj minst en produkt");

                                return;
                            }
                            if (wristbandNumber === undefined) {
                                setError("Armbandsnummer saknas");

                                return;
                            }

                            const wristbandResult = await getWristband(wristbandNumber)

                            if (!wristbandResult.data) {
                                setError("Armbandsnummer hittades inte")

                                return;
                            }

                            const wristbandData = wristbandResult.data;

                            const cartData: CartData = {
                                name: wristbandData.participant.name,
                                phone_number: wristbandData.participant.phone_number,
                                ssn: wristbandData.participant.ssn,
                                allergies: wristbandData.participant.allergies,
                                wristband_number: wristbandNumber,
                                items: Object.values(checkoutItems)
                            };

                            if (wristbandData.participant.seating && wristbandData.participant.seating.room) {
                                cartData.seat = `${wristbandData.participant.seating.room.name}:${wristbandData.participant.seating.name}`;
                            }

                            localStorage.setItem("cart", JSON.stringify(cartData));

                            router.push("/kiosk/checkout");
                        }}>Nästa</button>
                    </div>
                </div>
            </div>
            <div className="flex">
                <div className="w-[16%]"></div>
                <h1 className="text-5xl font-bold select-none invisible">ARMBANDSNUMMER:</h1>
                <p className="text-red-600">{ error }</p>
            </div>
        </>
    )
}