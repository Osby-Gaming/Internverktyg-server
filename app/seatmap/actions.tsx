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
    error: string | Error | null | unknown;
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

export async function claimSeat(seatmapAccessKey: string, seatName: string, roomName: string) {
    const participantReq = await getParticipantFromSeatmapAccessKey(seatmapAccessKey);

    if (participantReq.data === null) {
        return participantReq;
    }

    if (participantReq.data.seating && !(participantReq.data.seating.name === seatName && participantReq.data.seating.room.name === roomName)) {
        const unclaimReq = await unclaimSeatForParticipant(participantReq.data.seating.$id/*, participantReq.data.seating.room.$id*/);

        if (unclaimReq.data === null) {
            return unclaimReq;
        }
    }

    return await claimSeatForParticipant(seatName, roomName, participantReq.data.$id);
}