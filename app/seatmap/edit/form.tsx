"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Form({ rooms }: { rooms: any[] }) {
    const router = useRouter();

    const [selectedRoom, setSelectedRoom] = useState<string>(rooms[0]?.$id || "new");
    
    return (
        <>
            <select className="p-2 bg-gray-800 text-white rounded select-none" onChange={(e) => {
                setSelectedRoom(e.target.value);
            }}>
                {rooms.map((room: any) => (
                    <option key={room.$id} value={room.$id}>
                        {room.name}
                    </option>
                ))}
                <option key="new" value="new">
                    Skapa ny
                </option>
            </select>
            <button className="mt-4 p-2 rounded" onClick={() => {
                router.push(`/seatmap/edit/${selectedRoom}`);
            }}>
                Ladda rummet
            </button>
        </>
    )
}