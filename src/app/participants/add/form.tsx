'use client';

import { createParticipant } from "@/lib/appwrite_client";
import { useState } from "react";
import { getSeatmapAccessKey } from "./actions";

export default function Form() {
    const [ssn, setSsn] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [allergies, setAllergies] = useState('');
    const [phone_number, setPhoneNumber] = useState('');
    const [lastLink, setLastLink] = useState('');

    async function handleSubmit() {
        const seatMapAccessKey = await getSeatmapAccessKey(ssn)

        const participantReq = await createParticipant(ssn, name, email, allergies, phone_number, seatMapAccessKey);

        if (participantReq.data === null) {
            console.log(participantReq.error);
            alert("Fel inträffade när participant skulle skapas.");
            return;
        }

        alert("Participant skapad!");
        setSsn('');
        setName('');
        setEmail('');
        setAllergies('');
        setPhoneNumber('');

        setLastLink(`https://osbygaming.se/seatmap/1?access=${seatMapAccessKey}`)
    }

    return (
        <div>
            <form action={"#"}>
                <label htmlFor="ssn">Personnummer: </label>
                <input type="text" id="ssn" name="ssn" onChange={(e) => setSsn(e.target.value)} required />
                <br />
                <label htmlFor="name">Namn: </label>
                <input type="text" id="name" name="name" onChange={(e) => setName(e.target.value)} required />
                <br />
                <label htmlFor="email">Email: </label>
                <input type="text" id="email" name="email" onChange={(e) => setEmail(e.target.value)} required />
                <br />
                <label htmlFor="allergies">Allergier: </label>
                <input type="text" id="allergies" name="allergies" onChange={(e) => setAllergies(e.target.value)} />
                <br />
                <label htmlFor="phone_number">Telefonnummer: </label>
                <input type="text" id="phone_number" name="phone_number" onChange={(e) => setPhoneNumber(e.target.value)} required />
                <br />
                <button type="submit" onClick={handleSubmit}>Skicka</button>
            </form>
            <br />
            { lastLink === '' ? null : (<p>{ lastLink }</p>)}
        </div>
    );
}
