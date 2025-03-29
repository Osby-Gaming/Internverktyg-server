'use server';

import { claimSeatForParticipant, getAllSeats, getParticipantFromSeatmapAccessKey, unclaimSeatForParticipant } from "@/lib/appwrite_server";

export async function getSeatAvailability(seatmapAccessKey?: string): Promise<{
    status: number;
    message: string;
    data: ({
        number: string;
        room: string;
        taken: boolean;
        thisUser: boolean;
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
                let thisUser = false;

                if (seat?.participant?.seatmap_access_key === seatmapAccessKey) {
                    thisUser = true;
                }

                return {
                    number: seat.name,
                    room: seat.room.name,
                    taken: seat.participant !== null,
                    thisUser
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

export async function claimSeat(seatmapAccessKey: string, selectedSeat: string) {
    const participantReq = await getParticipantFromSeatmapAccessKey(seatmapAccessKey);

    if (participantReq.data === null) {
        return participantReq;
    }

    if (participantReq.data.seating) {
        const unclaimReq = await unclaimSeatForParticipant(participantReq.data.seating.$id);

        if (unclaimReq.data === null) {
            return unclaimReq;
        }
    }

    return await claimSeatForParticipant(selectedSeat, participantReq.data.$id);
}