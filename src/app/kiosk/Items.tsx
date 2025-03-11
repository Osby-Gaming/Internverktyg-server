'use client';

import { getKioskItems } from "@/lib/appwrite_client";
import { Models } from "appwrite";
import { useEffect, useState } from "react";
import Item from "./Item";

export default function Items({ handleAdd }: {handleAdd: (item: Models.Document) => void}) {
    const [items, setItems] = useState<Models.Document[]>([]);

    useEffect(() => {
        (async () => {
            const response = await getKioskItems();
            if (response.status === 200) {
                setItems(response.data ?? []);
            } else {
                // TODO: handle error
                console.error("Failed to fetch items", response);
            }
        })()
    }, []);

    const cols = Math.ceil(items.length*12 / 2);
    
    /* Add tabindex functionality for better accessibility */
    return (
        <div className="grid grid-rows-2" style={{
            width: 14 * cols + "vw",
            gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr)`
        }}>
            {items.map((item) => (
                <>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                <Item data={item} onClick={() => handleAdd(item)}/>
                </>
            ))}
        </div>
    )
}