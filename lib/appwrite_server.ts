import { Client, Databases, Query } from "node-appwrite";
import { Appwrite_Common } from "./appwrite_common";
import { MapRoomModelAppWrite, MapRoomModelAppWriteDocument, MapSeatClaimModelAppWriteDocument, ParticipantModelAppWrite, ParticipantModelAppWriteDocument, Response } from "./types";
import Map from "./seatmap/Map";
import { Cell, MapLayoutInput, PossibleZoomLevels } from "./seatmap/types";

const COMMONLIB = new Appwrite_Common(getAppwriteClient, Databases)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_HOSTNAME_OR_IP = process.env.APPWRITE_HOSTNAME_OR_IP || '';
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const COLLECTION_MAP_CLAIMS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MAP_CLAIMS_ID || '';
const COLLECTION_PARTICIPANTS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PARTICIPANTS_ID || '';
const COLLECTION_MAP_ROOMS = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_MAP_ROOMS_ID || '';


if (!PROJECT_ID) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_PROJECT_ID");
}
if (!DATABASE_ID) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_DATABASE_ID");
}
if (!APPWRITE_HOSTNAME_OR_IP) {
    throw new Error("Missing required environment variable APPWRITE_HOSTNAME_OR_IP");
}
if (!APPWRITE_API_KEY) {
    throw new Error("Missing required environment variable APPWRITE_API_KEY");
}
if (!COLLECTION_MAP_CLAIMS_ID) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_MAP_CLAIMS_ID");
}
if (!COLLECTION_PARTICIPANTS_ID) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_PARTICIPANTS_ID");
}
if (!COLLECTION_MAP_ROOMS) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_MAP_ROOMS");
}

export function getAppwriteClient() {
    const client = new Client();
    client
        .setEndpoint(`https://${APPWRITE_HOSTNAME_OR_IP}/v1`)
        .setProject(PROJECT_ID)
        .setKey(APPWRITE_API_KEY);

    return client;
}

export async function getAllRooms(include?: string[], limit?: number): Promise<Response<MapRoomModelAppWriteDocument[], string>> {
    const queries = [];

    if (include) {
        queries.push(Query.select(include));
    }
    if (limit) {
        queries.push(Query.limit(limit));
    }
    if (!limit) {
        queries.push(Query.limit(99999));
    }

    return COMMONLIB.listDocuments(COLLECTION_MAP_ROOMS, queries) as Promise<Response<MapRoomModelAppWriteDocument[], string>>;
}

export async function getRoom(id: string): Promise<Response<MapRoomModelAppWriteDocument, string>> {
    return await COMMONLIB.getDocument(COLLECTION_MAP_ROOMS, id) as Response<MapRoomModelAppWriteDocument, string>;
}

export async function claimSeatForParticipant(seatIndex: number, roomId: string, accessKey: string): Promise<Response<MapSeatClaimModelAppWriteDocument, string>> {
    const roomRes = await getRoom(roomId);

    if (roomRes.data === null) {
        return roomRes;
    }

    const cells = Map.processInputCells(JSON.parse(roomRes.data.cells_json) as (Cell | `${number}`)[]);

    const cell = cells[seatIndex];

    if (!cell || cell.type !== "seat") {
        return {
            status: 404,
            message: "Seat not found",
            data: null,
            error: "Seat not found"
        };
    }

    const participantReq = await COMMONLIB.listOneDocument(COLLECTION_PARTICIPANTS_ID, [
        Query.equal('seatmap_access_key', accessKey)
    ]);

    if (participantReq.data === null) {
        return participantReq;
    }

    if (participantReq.data.seat_claim !== null) {
        await unclaimSeat(participantReq.data.seat_claim.$id);
    }

    if (roomRes.data.claims?.some(claim => claim.index === seatIndex && claim.participant !== null)) {
        return {
            status: 400,
            message: 'Seat is already claimed',
            data: null,
            error: "Seat is already claimed"
        };
    }

    if (roomRes.data.claims?.some(claim => claim.index === seatIndex && claim.participant === null)) {
        await COMMONLIB.deleteDocument(COLLECTION_MAP_CLAIMS_ID, (roomRes.data.claims.find(claim => claim.index === seatIndex && claim.participant === null) as MapSeatClaimModelAppWriteDocument)!.$id);
    }

    return await COMMONLIB.insertDocument(COLLECTION_MAP_CLAIMS_ID, {
        index: seatIndex,
        room: roomRes.data.$id,
        participant: participantReq.data.$id
    }) as Response<MapSeatClaimModelAppWriteDocument, string>;
}

export async function unclaimSeat(claimId: string/*, roomId?: string*/): Promise<Response<MapSeatClaimModelAppWriteDocument, any>> {
    return await COMMONLIB.deleteDocument(COLLECTION_MAP_CLAIMS_ID, claimId) as Response<MapSeatClaimModelAppWriteDocument, any>;
}

export async function getParticipantFromSeatmapAccessKey(accessKey: string): Promise<Response<ParticipantModelAppWriteDocument, string>> {
    return await COMMONLIB.listOneDocument(COLLECTION_PARTICIPANTS_ID, [
        Query.equal('seatmap_access_key', accessKey)
    ]) as Response<ParticipantModelAppWriteDocument, string>;
}

export async function insertRoom(room: MapRoomModelAppWrite): Promise<Response<MapRoomModelAppWriteDocument, string>> {
    return await COMMONLIB.insertDocument(COLLECTION_MAP_ROOMS, room) as Response<MapRoomModelAppWriteDocument, string>;
}
export async function updateRoom(roomId: string, room: MapRoomModelAppWrite): Promise<Response<MapRoomModelAppWriteDocument, string>> {
    return await COMMONLIB.updateDocument(COLLECTION_MAP_ROOMS, roomId, room) as Response<MapRoomModelAppWriteDocument, string>;
}

export async function getRoomMapLayout(room_id: string, edit = false, access_key?: string): Promise<Response<[MapLayoutInput, number[]], string>> {
    const roomRes = await getRoom(room_id);

    if (roomRes.data === null) {
        return {
            status: 404,
            message: "Room not found",
            data: null,
            error: "Room not found"
        }
    }

    const { data } = roomRes;

    const cells = Map.processInputCells(JSON.parse(data.cells_json) as (Cell | `${number}`)[]);

    const availability: number[] = [];

    const claims = data.claims || [];

    for (const claim of claims) {
        if (!edit) {
            if (claim.participant !== null && claim.participant.seatmap_access_key !== access_key) {
                if (cells[claim.index] === null || cells[claim.index]?.type !== "seat") {
                    continue;
                }

                // @ts-expect-error
                if (!cells[claim.index].styleOverride) {
                    // @ts-expect-error
                    cells[claim.index].styleOverride = {};
                }

                // @ts-expect-error
                cells[claim.index].styleOverride.backgroundColor = "#f00";
            }

            if (claim.participant !== null && claim.participant.seatmap_access_key === access_key) {
                if (cells[claim.index] === null || cells[claim.index]?.type !== "seat") {
                    continue;
                }

                // @ts-expect-error
                if (!cells[claim.index].styleOverride) {
                    // @ts-expect-error
                    cells[claim.index].styleOverride = {};
                }

                // @ts-expect-error
                cells[claim.index].styleOverride.backgroundColor = "#00f";
            }
        }

        if (cells[claim.index] !== null && cells[claim.index]?.type === "seat") {
            availability.push(claim.index);
        }
    }

    return {
        status: 200,
        message: "Retrieved successfully",
        data: [{
            x: data.width,
            y: data.height,
            highestSeatNumber: data.highest_seat_number,
            cells,
            globalOverride: {
                backgroundColor: data.background_color ?? undefined,
                zoomLevel: parseInt(data.zoom_level) as PossibleZoomLevels,
                cellStyleOverride: JSON.parse(data.cell_style_override)
            }
        }, availability],
        error: null
    };
}