import { Client, Account, ID, Query, Databases } from "appwrite";
import { CheckoutItem, PaymentMethodEnum } from "./types";
import { Appwrite_Common } from "./appwrite_common";

const COMMONLIB = new Appwrite_Common(getAppwriteClient, Databases)

const COLLECTION_PARTICIPANTS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_PARTICIPANTS_ID || '';
const COLLECTION_WRISTBANDS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_WRISTBANDS_ID || '';
const COLLECTION_KIOSK_ITEMS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KIOSK_ITEMS_ID || '';
const COLLECTION_KIOSK_PURCHASES_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KIOSK_PURCHASES_ID || '';
const COLLECTION_KIOSK_VOUCHERS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_KIOSK_VOUCHERS_ID || '';
const COLLECTION_SEATINGS_ID = process.env.NEXT_PUBLIC_APPWRITE_COLLECTION_SEATINGS_ID || '';
const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID || '';

if (!PROJECT_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_PROJECT_ID');
}
if (!COLLECTION_PARTICIPANTS_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_PARTICIPANTS_ID');
}
if (!COLLECTION_WRISTBANDS_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_WRISTBANDS_ID');
}
if (!COLLECTION_KIOSK_ITEMS_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_KIOSK_ITEMS_ID');
}
if (!COLLECTION_KIOSK_PURCHASES_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_KIOSK_PURCHASES_ID');
}
if (!COLLECTION_KIOSK_VOUCHERS_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_KIOSK_VOUCHERS_ID');
}
if (!COLLECTION_SEATINGS_ID) {
    throw new Error('Missing required environment variable NEXT_PUBLIC_APPWRITE_COLLECTION_SEATINGS_ID');
}

export function getAppwriteClient() {
    const client = new Client()
        .setProject(PROJECT_ID);

    return client;
}

export const getLoggedInAccount = async () => {
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

export const getJWT = async () => {
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
            message: "Login failed",
            data: null,
            error
        };
    }
}

export const logoutAccount = async () => {
    try {
        const client = getAppwriteClient();
        const account = new Account(client);

        const result = await account.deleteSession(
            'current'
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

export async function getParticipant(ssn: string, include?: string[]) {
        const queries = [
            Query.equal('ssn', ssn)
        ];

        if (include) {
            queries.push(Query.select(include));
        }

        return COMMONLIB.listOneDocument(COLLECTION_PARTICIPANTS_ID, queries);
}

export async function getWristband(number: number, include?: string[]) {
        const queries = [
            Query.equal('number', number)
        ];

        if (include) {
            queries.push(Query.select(include));
        }

        return COMMONLIB.listOneDocument(COLLECTION_WRISTBANDS_ID, queries);
}

export async function getKioskItems(include?: string[]) {
        const queries = [];

        if (include) {
            queries.push(Query.select(include));
        }

        return COMMONLIB.listDocuments(COLLECTION_KIOSK_ITEMS_ID, queries);
}

export async function checkInParticipant(participant: string, wristbandID: number) {
        return COMMONLIB.insertDocument(COLLECTION_WRISTBANDS_ID, {
            number: wristbandID,
            participant
        });
}

export async function getKioskPurchase(purchaseID: string, include?: string[]) {
        const queries = [
            Query.equal('$id', purchaseID)
        ];

        if (include) {
            queries.push(Query.select(include));
        }

        return COMMONLIB.listOneDocument(purchaseID, queries);
}

export async function placeKioskPurchase(kioskItems: CheckoutItem[], wristbandID: string, payment_method: PaymentMethodEnum, voucherID?: string) {
        const kioskItemIDs = kioskItems.map(kioskItem => kioskItem.$id);
        const totalPrice = kioskItems.reduce((acc, curr) => acc + (curr.price * curr.amount), 0);

        return COMMONLIB.insertDocument(COLLECTION_KIOSK_ITEMS_ID, {
            timestamp: Date.now().toString(),
            wristband: wristbandID,
            kioskItems: kioskItemIDs,
            items_json: JSON.stringify(kioskItems),
            total: totalPrice,
            payment_method,
            voucher_id: voucherID
        })
}

export async function getAllSeats(include?: string[]) {
    const queries = [
        Query.limit(9999)
    ];

    if (include) {
        queries.push(Query.select(include));
    }

    return COMMONLIB.listDocuments(COLLECTION_SEATINGS_ID, queries);
}

