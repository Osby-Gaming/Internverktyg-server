import { Models } from "appwrite";
import { CheckoutItem, VoucherInstructions } from "./types";

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