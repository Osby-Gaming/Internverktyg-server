'use server';

import { getAllSeats } from "@/lib/appwrite_server";

export async function getSeatAvailability(): Promise<{
    status: number;
    message: string;
    data: ({
        number: string;
        room: string;
        taken: boolean;
    }[] | null);
    error: any;
}> {
    try {
        const allSeatsReq = await getAllSeats();

        if (allSeatsReq.data === null) {
            return allSeatsReq;
        }

        return {
            status: 200,
            message: "Seat availability fetched successfully",
            data: allSeatsReq.data.map((seat) => {
                return {
                    number: seat.name,
                    room: seat.room.name,
                    taken: seat.participant !== null
                }
            }),
            error: null
        }
    } catch(err) {
        return {
            status: 500,
            message: 'Något gick fel',
            data: null,
            error: err
        };
    }
}