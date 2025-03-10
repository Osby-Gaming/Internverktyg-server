import { Client, Account, ID, Databases, Query } from "appwrite";
import { response } from "./types";

const DATABASE_ID = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID || '';
const COLLECTION_PARTICIPANTS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PARTICIPANTS_ID || '';
const COLLECTION_WRISTBANDS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WRISTBANDS_ID || '';
const COLLECTION_KIOSK_ITEMS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KIOSK_ITEMS_ID || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

if (!DATABASE_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_DATABASE_ID');
}
if (!PROJECT_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_PROJECT_ID');
}

export const getAppwriteClient = () => {
    const client = new Client()
        .setProject(PROJECT_ID);

    return client;
}

export const getLoggedInAccount = async (): Promise<response> => {
    try {
        const client = getAppwriteClient();
        const account = new Account(client);

        const user = await account.get();

        return {
            status: 200,
            message: "Account gotten successfully",
            data: user,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Error",
            data: null,
            error
        };
    }
}

export const getJWT = async (): Promise<response>  => {
    try {
        const client = getAppwriteClient();
        const account = new Account(client);

        const token = await account.createJWT();

        return {
            status: 200,
            message: "Token gotten successfully",
            data: token,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Error",
            data: null,
            error
        };
    }
}

export const createAccount = async (email: string, password: string): Promise<response>  => {
    try {
        const client = getAppwriteClient();
        const account = new Account(client);

        const user = await account.create(
            ID.unique(),
            email,
            password
        );

        return {
            status: 200,
            message: "Account created successfully",
            data: user,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Account not created",
            data: null,
            error
        };
    }
}

export const loginAccount = async (email: string, password: string): Promise<response>  => {
    try {
        const client = getAppwriteClient();
        const account = new Account(client);
        
        const session = await account.createEmailPasswordSession(
            email,
            password
        );

        return {
            status: 200,
            message: "Logged in successfully",
            data: session,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Account not created",
            data: null,
            error
        };
    }
}

export const logoutAccount = async (): Promise<response> => {
    try {
        const client = getAppwriteClient();
        const account = new Account(client);
        
        const result = await account.deleteSession(
            'current' // sessionId
        );

        return {
            status: 200,
            message: "Logged out successfully",
            data: result,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Logout failed",
            data: null,
            error
        };
    }
}

export const insertDocument = async (databaseID: string, collectionID: string, data: Record<string, any>): Promise<response>  => {
    try {
        const client = getAppwriteClient();
        const databases = new Databases(client);
        
        const result = await databases.createDocument(databaseID, collectionID, ID.unique(), data);

        return {
            status: 200,
            message: "Inserted successfully",
            data: result,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Document not inserted",
            data: null,
            error
        };
    }
}

export const createDocument = async (databaseID: string, collectionID: string, data: Record<string, any>, id: string): Promise<response>  => {
    try {
        const client = getAppwriteClient();
        const databases = new Databases(client);
        
        const result = await databases.createDocument(databaseID, collectionID, id, data);
        return {
            status: 200,
            message: "Created successfully",
            data: result,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Document not created",
            data: null,
            error
        };
    }
}

export async function getParticipant(ssn: string, include?: string[]) {
    try {
        const client = getAppwriteClient();
        const databases = new Databases(client);

        const queries = [
            Query.equal('ssn', ssn)
        ];

        if (include) {
            queries.push(Query.select(include));
        }
        
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_PARTICIPANTS_ID,
            queries
        );

        return {
            status: 200,
            message: "Gotten successfully",
            data: result?.documents[0],
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Document not retrieved",
            data: null,
            error
        };
    }
}

export async function getWristband(number: number, include?: string[]) {
    try {
        const client = getAppwriteClient();
        const databases = new Databases(client);

        const queries = [
            Query.equal('number', number)
        ];

        if (include) {
            queries.push(Query.select(include));
        }
        
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_WRISTBANDS_ID,
            queries
        );

        return {
            status: 200,
            message: "Retrieved successfully",
            data: result?.documents[0],
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Document not retrieved",
            data: null,
            error
        };
    }
}

export async function getKioskItems(include?: string[]) {
    try {
        const client = getAppwriteClient();
        const databases = new Databases(client);

        const queries = [];

        if (include) {
            queries.push(Query.select(include));
        }
        
        const result = await databases.listDocuments(
            DATABASE_ID,
            COLLECTION_KIOSK_ITEMS_ID,
            queries
        );

        return {
            status: 200,
            message: "Retrieved successfully",
            data: result.documents,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Document not retrieved",
            data: null,
            error
        };
    }
}

export async function checkInParticipant(participant: string, wristbandID: number) {
    try {
        const client = getAppwriteClient();
        const databases = new Databases(client);
        
        const result = await databases.createDocument(
            DATABASE_ID,
            COLLECTION_WRISTBANDS_ID,
            ID.unique(),
            {
                number: wristbandID,
                participant
            }
        );

        return {
            status: 200,
            message: "Created successfully",
            data: result,
            error: null
        };
    } catch (error: any) {
        if (error.name && error.name === 'AppwriteException') {
            return {
                status: error.code,
                message: error.response.message,
                data: null,
                error
            }
        }

        return {
            status: 500,
            message: "Wristband check-in failed",
            data: null,
            error
        };
    }
}