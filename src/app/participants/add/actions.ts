'use server';

import { createSeatMapKey } from "@/lib/util";

export async function getSeatmapAccessKey(ssn: string) {
    // change this to be less predictable
    return createSeatMapKey(ssn);
}