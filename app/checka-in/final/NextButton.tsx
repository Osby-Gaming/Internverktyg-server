'use client'

import { checkInParticipant, generateVouchersForParticipant, getParticipant } from "@/lib/appwrite_client";
import Loading from "@/lib/components/loading";
import { useRouter, useSearchParams } from "next/navigation";
import { JSX, useState } from "react";

export default function NextButton() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const [error, setError] = useState("");
    const [buttonContent, setButtonContent] = useState<string | JSX.Element>("Godkänn")

    const ssn = searchParams.get('ssn');
    const wId = searchParams.get('id');

    if (!ssn || !ssn.match(/^\d{12}$/)) {
        router.push("/checka-in");
        return;
    }

    if (!wId || !wId.match(/^\d{1,6}$/)) {
        router.push("/checka-in");
        return;
    }

    return (
        <div>
            <button className="text-3xl" onClick={async () => {
                setButtonContent(Loading());
                const result = await getParticipant(ssn);

                if (result.status !== 200) {
                    setButtonContent("Godkänn");
                    return setError(result.message);
                }

                const participant = result.data;

                if (!participant) {
                    setButtonContent("Godkänn");
                    return setError("Deltagaren hittades inte");
                }

                if (participant.wristband != null) {
                    setButtonContent("Godkänn");
                    return setError("Deltagaren har redan blivit incheckad");
                }

                // Potential todo is to check if wristband has been used at this stage,
                // but this is unlikely to be a problem and is only for polishing the project

                const checkinResult = await checkInParticipant(participant.$id, parseInt(wId));

                if (checkinResult.data === null) {
                    setButtonContent("Godkänn");
                    return setError(checkinResult.message);
                }

                await generateVouchersForParticipant(checkinResult.data.$id);

                // Implement error handling here

                router.push("/checka-in/confirmation");
            }}>
                {buttonContent}
            </button>
            <div className="relative">
                <p className="error absolute m-auto w-fit left-0 right-0">{error}</p>
            </div>
        </div>
    )
}