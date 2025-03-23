import { Client, Databases, Query } from "node-appwrite";
import { Appwrite_Common } from "./appwrite_common";

const COMMONLIB = new Appwrite_Common(getAppwriteClient, Databases)

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';
const APPWRITE_HOSTNAME_OR_IP = process.env.APPWRITE_HOSTNAME_OR_IP || ''
const APPWRITE_API_KEY = process.env.APPWRITE_API_KEY || '';
const COLLECTION_SEATINGS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SEATINGS_ID || '';

if (!PROJECT_ID) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_PROJECT_ID");
}
if (!DATABASE_ID ) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_DATABASE_ID");
}
if (!APPWRITE_HOSTNAME_OR_IP) {
    throw new Error("Missing required environment variable APPWRITE_HOSTNAME_OR_IP");
}
if (!APPWRITE_API_KEY) {
    throw new Error("Missing required environment variable APPWRITE_API_KEY");
}
if (!COLLECTION_SEATINGS_ID) {
    throw new Error("Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_SEATINGS_ID");
}

export function getAppwriteClient() {
    const client = new Client();
    client
        .setEndpoint(`https://${APPWRITE_HOSTNAME_OR_IP}/v1`)
        .setProject(PROJECT_ID)
        .setKey(APPWRITE_API_KEY);

    return client;
}

export async function getAllSeats(include?: string[], limit?: number) {
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

        return COMMONLIB.listDocuments(COLLECTION_SEATINGS_ID, queries);
}