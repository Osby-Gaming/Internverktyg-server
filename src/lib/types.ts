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
}

export type PaymentMethodEnum = 'swish' | 'cash' | 'voucher';