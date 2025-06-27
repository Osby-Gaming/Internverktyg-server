'use server';

import { getRoom, insertRoom, updateRoom } from "@/lib/appwrite_server";
import { MapLayoutInput, PossibleZoomLevels } from "@/lib/seatmap/types";
import { MapRoomModelAppWriteDocument, Response } from "@/lib/types";

export async function createMap(data: MapLayoutInput, roomName: string): Promise<Response<MapRoomModelAppWriteDocument, string>> {
    return await insertRoom({
        name: roomName,
        claims: null,
        width: data.x,
        height: data.y,
        highest_seat_number: data.highestSeatNumber,
        zoom_level: (data.globalOverride?.zoomLevel ?? 1).toString() as `${PossibleZoomLevels}`,
        background_color: data.globalOverride?.backgroundColor ?? null,
        cell_style_override: JSON.stringify(data.globalOverride?.cellStyleOverride ?? {}),
        cells_json: JSON.stringify(data.cells)
    });
}

export async function updateMap(data: MapLayoutInput, roomId: string, newName?: string): Promise<Response<MapRoomModelAppWriteDocument, string>> {
    const roomRes = await getRoom(roomId);

    if (roomRes.data === null) {
        return {
            status: 404,
            message: "Room not found",
            data: null,
            error: "Room not found"
        };
    }

    // @ts-expect-error
    return await updateRoom(roomId, {
        name: newName || roomRes.data.name,
        width: data.x,
        height: data.y,
        zoom_level: (data.globalOverride?.zoomLevel ?? 1).toString() as `${PossibleZoomLevels}`,
        background_color: data.globalOverride?.backgroundColor ?? null,
        cell_style_override: JSON.stringify(data.globalOverride?.cellStyleOverride ?? {}),
        cells_json: JSON.stringify(data.cells)
    });
}