import { Client, Account, ID } from "appwrite";

export const getAppwriteClient = () => {
    const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID;

    if (!PROJECT_ID) {
        throw new Error('Missing required environment variable APPWRITE_PROJECT_ID');
    }

    const client = new Client()
        .setProject(PROJECT_ID);

    return client;
}

export const createAccount = async (email: string, password: string) => {
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

export const loginAccount = async (email: string, password: string) => {
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