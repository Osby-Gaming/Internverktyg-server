import { Client, Account, ID } from "appwrite";
import { response } from "./types";

export const getAppwriteClient = () => {
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    if (!PROJECT_ID) {
        throw new Error('Missing required environment variable APPWRITE_PROJECT_ID');
    }

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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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
        console.log(error);
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