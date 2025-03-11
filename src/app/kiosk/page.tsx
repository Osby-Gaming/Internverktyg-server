'use client';

import { useState } from "react";
import Items from "./Items";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";

interface CheckoutItem {
    name: string;
    price: number;
    amount: number;
    stock: number;
}

export default function Page() {
    const [checkoutItems, setCheckoutItems] = useState<Record<string, CheckoutItem>>({});

    return (
        <div className="flex">
            <div className="w-[58vw] height-[90vh]">
                <h1 className="text-6xl mb-8 font-bold">KASSA</h1>
                <div className="min-h-[75vh] overflow-x-scroll whitespace-nowrap overflow-visible">
                    <Items handleAdd={(item) => {
                        const checkoutItemsCopy = { ...checkoutItems };

                        if (checkoutItemsCopy[item.$id] && checkoutItemsCopy[item.$id].stock !== checkoutItemsCopy[item.$id].amount) {
                            checkoutItemsCopy[item.$id].amount++;
                        } else if (checkoutItemsCopy[item.$id] && checkoutItemsCopy[item.$id].stock === checkoutItemsCopy[item.$id].amount) {
                            // Just catch the case where the amount is the same as the available stock.
                            // Without this the amount just resets to 1 after exceeding stock.
                        } else if (item.stock > 0) {
                            checkoutItemsCopy[item.$id] = { name: item.name, price: item.price, amount: 1, stock: item.stock };
                        }

                        setCheckoutItems(checkoutItemsCopy);
                    }} />
                </div>
            </div>
            <div className="w-[2vw]"></div>
            <div className="w-[30vw] height-[90vh] relative">
                <div className="absolute z-10 w-full h-full bg-[#181818] rounded-3xl">
                    <ul>
                        {Object.keys(checkoutItems).map((i) =>
                            <li key={i} className="flex">
                                <FontAwesomeIcon icon={faMinus} />
                                <FontAwesomeIcon icon={faPlus} />
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
    );
}
