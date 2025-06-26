import { Models } from "appwrite";
import { CheckoutItem, Response, VoucherInstructions } from "./types";
import { getParticipantFromSeatmapAccessKey, getRoom } from "./appwrite_server";
import { Cell, MapLayoutInput, PossibleZoomLevels } from "./seatmap/types";

export function getAgeFromSSN(ssn: string): number {
    const year = parseInt(ssn.slice(0, 4));
    const month = parseInt(ssn.slice(4, 6));
    const day = parseInt(ssn.slice(6, 8));

    const date = new Date(year, month - 1, day);
    const currentDate = new Date();

    const timeSince = currentDate.getTime() - date.getTime();

    const age = Math.abs(new Date(timeSince).getUTCFullYear() - 1970);

    return age;
}

const cyrb53 = (str: string, seed = 0) => {
    let h1 = 0xdeadbeef ^ seed, h2 = 0x41c6ce57 ^ seed;
    for (let i = 0, ch; i < str.length; i++) {
        ch = str.charCodeAt(i);
        h1 = Math.imul(h1 ^ ch, 2654435761);
        h2 = Math.imul(h2 ^ ch, 1597334677);
    }
    h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507);
    h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3266489909);
    h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507);
    h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3266489909);

    return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

/**
 * BACKEND ONLY
 * @param ssn 
 */
export function createSeatMapKey(ssn: string) {
    return cyrb53(ssn).toString();
    return Bun.hash(ssn).toString();
}

export function generateVoucherInstructions(itemsIn: CheckoutItem[], vouchers: Models.Document[]): VoucherInstructions {
    const items = itemsIn.map(item => ({ ...item }));

    const instructions = {
        use_vouchers: [] as string[],
        subtract: 0
    }

    for (const voucher of vouchers) {
        let i;

        if (items.find((item, i2) => {
            console.log(item, voucher);
            i = i2;

            console.log(i2, item.$id, voucher.kioskItem.$id, voucher)

            return item.$id === voucher.kioskItem.$id && voucher.kioskPurchase == null;
        }) && i !== undefined && items[i].amount > 0) {
            instructions.use_vouchers.push(voucher.$id);
            instructions.subtract += items[i].price;
            items[i].amount--;
        }
    }

    return instructions;
}

/**
 * Cross platform password validation
 */
export function validatePassword(password: string): [boolean, string] {
    if (password.length < 7) {
        return [false, 'Password must be at least 7 characters long'];
    }
    if (!password.match(/[a-z]/)) {
        return [false, 'Password must contain at least one lowercase letter'];
    }
    if (!password.match(/[A-Z]/)) {
        return [false, 'Password must contain at least one uppercase letter'];
    }
    if (!password.match(/[0-9]/)) {
        return [false, 'Password must contain at least one number'];
    }
    if (!password.match(/[^a-zA-Z0-9]/)) {
        return [false, 'Password must contain at least one special character'];
    }

    return [true, ''];
}

/**
 * Cross platform email format validation
 */
export function validateEmailFormat(email: string): [boolean, string] {
    // Regex for validating email format (https://emailregex.com/)
    const emailRegex = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9]))\.){3}(?:(2(5[0-5]|[0-4][0-9])|1[0-9][0-9]|[1-9]?[0-9])|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

    if (!emailRegex.test(email)) {
        return [false, 'Invalid email format'];
    }
    return [true, ''];
}

export function generateKittyError(errorReason: string): string {
    return `    　　　　　    ＿＿
    　　　　　🌸＞　　フ This is Jane 
    　　　　　| 　_　 _ l   She is sad because ${errorReason}
    　 　　　／\` ミ＿xノ  Try again later
    　　 　 /　　　 　 |
    　　　 /　 ヽ　　 ﾉ
    　 　 │　　|　|　|
    　／￣|　　 |　|　|
    　| (￣ヽ＿_ヽ_)__)
    　＼二つ`
}

/**
 * Backend only
 */
export async function getRoomMapLayout(room_id: string, edit = false, access_key?: string): Promise<Response<MapLayoutInput, string>> {
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

    return {
        status: 200,
        message: "Retrieved successfully",
        data: {
            x: data.width,
            y: data.height,
            cells: JSON.parse(data.cells_json),
            globalOverride: {
                backgroundColor: data.background_color ?? undefined,
                zoomLevel: parseInt(data.zoom_level) as PossibleZoomLevels,
                cellStyleOverride: JSON.parse(data.cell_style_override)
            }
        },
        error: null
    };
}