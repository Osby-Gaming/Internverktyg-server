import { Client } from "appwrite";

export const getAppwriteClient = () => {
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    if (!PROJECT_ID) {
        throw new Error('Missing required environment variable APPWRITE_PROJECT_ID');
    }

    const client = new Client()
        .setProject(PROJECT_ID);

    return client;
}
