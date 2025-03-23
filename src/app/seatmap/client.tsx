'use client';
import { useEffect } from "react";
import { getSeatAvailability } from "./actions";

export default function Client() {
    useEffect(() => {
        (async () => {
            const response = await getSeatAvailability();

            if (response.data === null) {
                alert(response.message);
                return;
            }

            console.log(response);
        })()
    }, [])
    return (
        <div>
            <h1 className="text-6xl mb-8 font-bold select-none">KASSA</h1>
        </div>
    );
}
