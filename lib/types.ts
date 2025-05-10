import { Models } from "appwrite";

export type response = {
    status: number;
    message: string;
    data: any;
    error: any;
}

export interface CheckoutItem {
    $id: string;
    name: string;
    price: number;
    amount: number;
    stock: number;
    age_restricted_15: boolean;
}

export interface CartData {
    name: string;
    ssn: string;
    phone_number: string;
    wristband_number: number;
    allergies: string;
    seat?: string;
    items: CheckoutItem[];
    vouchers: Models.Document[];
}

export interface VoucherInstructions {
    /**
     * IDs of the vouchers
     */
    use_vouchers: string[],
    subtract: number
}

export type PaymentMethodEnum = 'swish' | 'cash' | 'custom';