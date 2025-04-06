import { redirect } from "next/navigation";
import WristbandNumberInput from "./WristbandNumberInput";

export default async function Page({ searchParams }: { searchParams: Promise<{[key: string]: string | string[] | undefined}>}) {
    let { ssn } = await searchParams;
    if (Array.isArray(ssn)) {
        ssn = ssn[0];
    }

    if (!ssn || !ssn.match(/^\d{12}$/)) {
        redirect("/checka-in");
    }

    return (
        <div>
            <h1 className="text-5xl text-center mb-4">Ange Armbandsnummer</h1>
            <WristbandNumberInput />
        </div>
    );
}
