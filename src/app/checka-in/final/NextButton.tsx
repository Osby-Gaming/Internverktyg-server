'use client'

import { checkInWristband, getParticipant } from "@/lib/appwrite_client";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

export default function NextButton() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [error, setError] = useState("");

    const ssn = searchParams.get('ssn');
    const wId = searchParams.get('id');

    if (!ssn || !ssn.match(/^\d{12}$/)) {
        router.push("/checka-in");
        return;
    }

    if (!wId || !wId.match(/^\d{0,4}$/)) {
        router.push("/checka-in");
        return;
    }

    return (
        <div>
            <button className="text-3xl" onClick={async () => {
                const result = await getParticipant(ssn);

                if (result.status !== 200) {
                    return setError(result.message);
                }

                const participant = result.data;

                if (!participant) {
                    return setError("Deltagaren hittades inte");
                }

                if (participant.wristband != null) {
                    return setError("Deltagaren har redan blivit incheckad");
                }

                const wResult = await checkInWristband(participant.$id, parseInt(wId));

                if (wResult.status !== 200) {
                    return setError(wResult.message);
                }

                router.push("/checka-in/confirmation");
            }}>
                Godkänn
            </button>
            <div className="relative">
                <p className="error absolute m-auto w-fit left-0 right-0">{error}</p>
            </div>
        </div>
    )
}