'use client';

import { useState } from "react";
import NumpadInput from "../NumpadInput";
import { validate } from "./actions";
import { useRouter, useSearchParams } from "next/navigation";

export default function WristbandNumberInput() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [input, setInput] = useState("");
    const [error, setError] = useState("");

    function inputToFormatted(): string {
        return "0".repeat(4 - input.length) + input;
    }

    async function submit() {
        if (!input) {
            return setError("Armbandsnummer saknas");
        }

        const validationResult = await validate(input);
        if (!validationResult.data) {
            return setError(validationResult.message);
        }

        router.push("/checka-in/final?ssn=" + searchParams.get("ssn") + "&id=" + input);
    }

    function backspace() {
        if (input.length > 0) setInput(input.slice(0, input.length - 1));
    }

    function hInput(value: string) {
        if (!input && value === "0") return;
        if (input.length < 4) setInput(input + value);
    }

    return (
        <>
            <div className="w-full flex justify-center items-center">
                <input className="text-4xl w-fit p-4 text-center text-white" type="text" value={inputToFormatted()} readOnly onKeyDown={(e) => {
                    if ("0123456789".includes(e.key)) {
                        hInput(e.key);
                    } else if (e.key == "Backspace" || e.key == "Delete") {
                        backspace();
                    } else if (e.key == "Enter") {
                        submit();
                    }
                }} />
            </div >
            <div className="relative">
                <p className="error absolute m-auto w-fit left-0 right-0">{error}</p>
            </div>
            <div className="w-full flex justify-center items-center">
                <NumpadInput onNumber={(value: string) => {
                    hInput(value);
                }} onDelete={() => {
                    backspace();
                }} />
            </div>
            <div className="w-full flex justify-center items-center">
                <button className="mt-[48px] text-4xl font-semibold px-16 py-5" onClick={submit}>NÄSTA</button>
            </div >
        </>
    );
}
