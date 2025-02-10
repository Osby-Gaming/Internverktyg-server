'use server'

type response = {
    status: number;
    message: string;
    data: any;
    error: any;
}

export async function validate(personnummer: string): Promise<response> {
    if (!personnummer || !personnummer.match(/^\d{12}$/)) {
        return {
            status: 400,
            message: 'Felaktigt personnummer',
            data: false,
            error: null
        };
    }

    try {
        const response = await fetch("https://ebas.sverok.se/apis/confirm_membership.json", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                request: {
                    action: "confirm_membership",
                    association_number: process.env.SVEROK_F_ID,
                    api_key: process.env.SVEROK_API_NYCKEL,
                    socialsecuritynumber: personnummer
                }
            })
        })

        // @ts-ignore
        if (!response.ok || !(await response.json()).response.member_found) {
            return {
                status: response.status,
                message: 'Deltagare kunde ej hittas',
                data: false,
                error: null
            };
        }

        return {
            status: 200,
            message: 'Verifiering lyckades',
            data: true,
            error: null
        };
    } catch (err) {
        return {
            status: 500,
            message: 'Något gick fel',
            data: false,
            error: err
        };
    }
}