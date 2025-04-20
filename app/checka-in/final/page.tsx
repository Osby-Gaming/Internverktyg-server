import { redirect } from "next/navigation";
import NextButton from "./NextButton";
import ParticipantTable from "./ParticipantTable";

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

    if (!id || !id.match(/^\d{1,6}$/)) {
        return redirect("/checka-in");
    }

    return (
        <div>
            <h1 className="text-6xl text-center mb-10">Personuppgifter</h1>
            <div className="flex justify-center mb-20">
                <div className="grid grid-cols-2 grid-rows-5 gap-y-5 gap-x-32 text-4xl">
                    <ParticipantTable ssn={ssn} wristbandNumber={id} />
                </div>
            </div>
            <div className="flex justify-center">
                <NextButton />
            </div>
        </div>
    );
}