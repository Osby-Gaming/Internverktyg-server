"use server"

import { claimSeatForParticipant, getRoomMapLayout } from "@/lib/appwrite_server"
import { MapLayoutInput } from "@/lib/seatmap/types";
import { MapSeatClaimModelAppWriteDocument, Response } from "@/lib/types";

export async function claimSeat(index: number, roomId: string, accessKey: string): Promise<Response<MapSeatClaimModelAppWriteDocument, string>> {
    return await claimSeatForParticipant(index, roomId, accessKey);
}

export async function getMapLayout(roomId: string, accessKey: string): Promise<Response<[MapLayoutInput, number[]], string>> {
    return getRoomMapLayout(roomId, false, accessKey);
}