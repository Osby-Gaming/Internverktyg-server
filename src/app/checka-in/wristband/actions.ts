'use server'

import { response } from "@/lib/types";

export async function validate(input: string): Promise<response> {
    return {
        status: 200,
        message: "Input is valid",
        data: true,
        error: null
    }
}