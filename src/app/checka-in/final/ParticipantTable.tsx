'use client';

import { getParticipant } from "@/lib/appwrite_client";
import { getAgeFromSSN } from "@/lib/util";
import { useEffect, useState } from "react";

async function participantName(ssn: string): Promise<string> {
    const participant = await getParticipant(ssn);

    console.log(participant);
    if (participant.status === 200 && participant.data) {
        return participant.data.name;
    } else {
        return "Deltagaren hittades inte";
    }
}

export default function ParticipantTable({ ssn }: { ssn: string }) {
    const [name, setName] = useState('')
    useEffect(() => {
        participantName(ssn).then(name => {
            setName(name);
        })
    }, [])

    return (
        <>
            <h3>Namn:</h3><h3>{ name }</h3>
            <h3>Ålder:</h3><h3>{ getAgeFromSSN(ssn) }</h3>
            <h3>Bord:</h3><h3>R1:13</h3>
            <h3>Armbandsnummer:</h3><h3>Nr.2</h3>
        </>
    )
}