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

/**
 * BACKEND ONLY
 * @param ssn 
 */
export function createSeatMapKey(ssn: string) {
    return Bun.hash(ssn).toString();
}

export function generateVoucherInstructions(itemsIn: CheckoutItem[], vouchers: Models.Document[]): VoucherInstructions {
    console.log(vouchers)
    const items = itemsIn.map(item => ({ ...item }));

    const instructions = {
        use_vouchers: [] as string[],
        subtract: 0
    }

    for (let voucher of vouchers) {
        let i;

        if (items.find((item, i2) => {
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