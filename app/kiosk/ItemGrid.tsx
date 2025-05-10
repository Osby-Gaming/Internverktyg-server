'use client';

import { getKioskItems } from "@/lib/appwrite_client";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import Item from "./Item";
import { generateKittyError } from "@/lib/util";

export default function ItemGrid({ handleAdd }: {handleAdd: (item: Models.Document) => void}) {
    const [items, setItems] = useState<Models.Document[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const kioskItemsResponse = await getKioskItems();

            if (kioskItemsResponse.status === 200) {
                setItems(kioskItemsResponse.data?.filter(item => item.stock > 0) ?? []);
            } else {
                setError(generateKittyError("the items failed to load"));

                console.error(kioskItemsResponse.message);
            }
        })()
    }, []);

    const cols = Math.ceil(items.length / 2);
    
    /* Add tabindex functionality for better accessibility */
    return (
        error === null ? (
            <div className="grid grid-rows-2" style={{
                width: 14 * cols + "rem",
                gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr)`
            }}>
                {items.map((item) => (
                    <Item key={item.$id} data={item} onClick={() => handleAdd(item)}/>
                ))}
            </div>
        ) : (
            <pre className="text-pink-200">
                { error }
            </pre>
        )
    )
}