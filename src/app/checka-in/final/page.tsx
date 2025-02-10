import { redirect } from "next/navigation";
import NextButton from "./NextButton";
import { getParticipant } from "@/lib/appwrite_client";

function getAgeFromSSN(ssn: string): number {
    const year = parseInt(ssn.slice(0, 4));
    const month = parseInt(ssn.slice(4, 6));
    const day = parseInt(ssn.slice(6, 8));

    const date = new Date(year, month - 1, day);
    const currentDate = new Date();

    const timeSince = currentDate.getTime() - date.getTime();

    const age = Math.abs(new Date(timeSince).getUTCFullYear() - 1970);

    return age;
}

export default async function Page({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
    let { ssn, id } = await searchParams;
    if (Array.isArray(ssn)) {
        ssn = ssn[0];
    }

    if (!ssn || !ssn.match(/^\d{12}$/)) {
        return redirect("/checka-in");
    }

    if (Array.isArray(id)) {
        id = id[0];
    }

    if (!id || !id.match(/^\d{0,4}$/)) {
        return redirect("/checka-in");
    }

    const lookup = await getParticipant(ssn);

    if (lookup.status !== 200) {
        return redirect("/checka-in/error?err=" + lookup.message);
    }

    const participant = lookup.data;

    if (!participant) {
        return redirect("/checka-in/error?err=" + "Ingen sådan deltagare");
    }

    if (participant.wristband) {
        return redirect("/checka-in/error?err=" + "Deltagaren har redan fått ett armbandsnummer");
    }

    return (
        <div>
            <h1 className="text-6xl text-center mb-10">Personuppgifter</h1>
            <div className="flex justify-center mb-20">
                <div className="grid grid-cols-2 grid-rows-5 gap-y-5 gap-x-32 text-4xl">
                    <h3>Namn:</h3><h3>{ participant.name }</h3>
                    <h3>Ålder:</h3><h3>{ getAgeFromSSN(ssn)}</h3>
                    <h3>Bord:</h3><h3>R1:13</h3>
                    <h3>Armbandsnummer:</h3><h3>Nr.2</h3>
                </div>
            </div>
            <div className="flex justify-center">
                <NextButton />
            </div>
        </div>
    );
}