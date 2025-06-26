import { Client, Databases, Query } from "node-appwrite";
import { Appwrite_Common } from "./appwrite_common";
import { MapRoomModelAppWrite, MapRoomModelAppWriteDocument, MapSeatClaimModelAppWriteDocument, ParticipantModelAppWrite, ParticipantModelAppWriteDocument, Response } from "./types";

const COMMONLIB = new Appwrite_Common(getAppwriteClient, Databases)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_HOSTNAME_OR_IP = process.env.APPWRITE_HOSTNAME_OR_IP || ''
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

export async function claimSeatForParticipant(seatIndex: number, roomId: string, participantId: string): Promise<Response<MapSeatClaimModelAppWriteDocument, string>> {
    const roomReq = await getRoom(roomId);

    if (roomReq.data === null) {
        return roomReq;
    }

    const participantReq = await COMMONLIB.getDocument(COLLECTION_PARTICIPANTS_ID, participantId);

    if (participantReq.data === null) {
        return participantReq;
    }

    if (participantReq.data.seat_claim !== null) {
        await unclaimSeat(participantReq.data.seat_claim.$id);
    }

    if (roomReq.data.claims?.some(claim => claim.index === seatIndex && claim.participant !== null)) {
        return {
            status: 400,
            message: 'Seat is already claimed',
            data: null,
            error: "Seat is already claimed"
        };
    }

    if (roomReq.data.claims?.some(claim => claim.index === seatIndex && claim.participant === null)) {
        await COMMONLIB.deleteDocument(COLLECTION_MAP_CLAIMS_ID, (roomReq.data.claims.find(claim => claim.index === seatIndex && claim.participant === null) as MapSeatClaimModelAppWriteDocument)!.$id);
    }

    return await COMMONLIB.insertDocument(COLLECTION_MAP_CLAIMS_ID, {
        index: seatIndex,
        room: roomReq.data.$id,
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