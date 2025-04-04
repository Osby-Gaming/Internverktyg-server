'use client';

import { getParticipant } from "@/lib/appwrite_client";
import { getAgeFromSSN } from "@/lib/util";
import { Models } from "appwrite";
import { useEffect, useState } from "react";

export default function ParticipantTable({ ssn, wristbandNumber }: { ssn: string, wristbandNumber: string }) {
    const [participant, setParticipant] = useState<Models.Document | null>(null);

    useEffect(() => {
        (async () => {
            const participant = await getParticipant(ssn);
            // @TODO Add error handling
            setParticipant(participant.data);
        })()
    }, [])

    return (
        <>
            <h3>Namn:</h3><h3>{participant?.name}</h3>
            <h3>Ålder:</h3><h3>{getAgeFromSSN(ssn)}</h3>
            <h3>Bord:</h3><h3>{participant?.seating?.room?.name}:{participant?.seating?.name}</h3>
            <h3>Armbandsnummer:</h3><h3>Nr.{wristbandNumber}</h3>
        </>
    )
}