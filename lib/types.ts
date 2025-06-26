import { Models } from "appwrite";
import { CellType, PossibleZoomLevels } from "./seatmap/types";

export type Response<T, E> = {
    status: number;
    message: string;
    data: null;
    error: E;
} | {
    status: number;
    message: string;
    data: T;
    error: null;
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

export type KioskVoucherModelAppWriteDocument = KioskVoucherModelAppWrite & Models.Document;

export interface KioskVoucherModelAppWrite {
    kioskItem: KioskItemModelAppWrite | null;
    kioskPurchase: KioskPurchaseModelAppWrite | null;
    wristband: WristbandModelAppWrite | null;
}

export type KioskItemModelAppWriteDocument = KioskItemModelAppWrite & Models.Document;

export interface KioskItemModelAppWrite {
    name: string;
    price: number;
    stock: number;
    age_restricted_15: boolean;
    thumbnail_url: string;
}

export type KioskPurchaseModelAppWriteDocument = KioskPurchaseModelAppWrite & Models.Document;

export interface KioskPurchaseModelAppWrite {
    timestamp: string;
    wristband: WristbandModelAppWrite | null;
    kioskItems: KioskItemModelAppWrite[] | null;
    items_json: string;
    total: number;
    payment_method: PaymentMethodEnum;
    custom_payment_note: string | null;
    kioskVouchers: KioskVoucherModelAppWrite | null;
}

export type ParticipantModelAppWriteDocument = ParticipantModelAppWrite & Models.Document;

export interface ParticipantModelAppWrite {
    name: string;
    email: string;
    ssn: string;
    phone_number: string;
    allergies: string | null;
    seatmap_access_key: string;
    wristband: WristbandModelAppWrite | null;
}

export type WristbandModelAppWriteDocument = WristbandModelAppWrite & Models.Document;

export interface WristbandModelAppWrite {
    number: number;
    participant: ParticipantModelAppWrite | null;
    kioskPurchases: KioskPurchaseModelAppWrite[] | null;
    kioskVouchers: KioskVoucherModelAppWrite[] | null;
}

export type MapSeatClaimModelAppWriteDocument = MapSeatClaimModelAppWrite & Models.Document;

export interface MapSeatClaimModelAppWrite {
    participant: ParticipantModelAppWrite | null;
    room: MapRoomModelAppWrite | null;
    index: number;
}

export type MapRoomModelAppWriteDocument = MapRoomModelAppWrite & Models.Document;

export interface MapRoomModelAppWrite {
    name: string;
    claims: MapSeatClaimModelAppWrite[] | null;
    width: number;
    height: number;
    background_color: string | null;
    zoom_level: `${PossibleZoomLevels}`;
    cell_style_override: string;
    cells_json: string;
};