'use client';

import { useState } from "react";
import NumpadInput from "./NumpadInput";
import { validate } from "./actions";
import { useRouter } from "next/navigation";

export default function SSNInput() {
    const router = useRouter();
    const [input, setInput] = useState("");
    const [error, setError] = useState("");

    function inputToPersonnummer(): string {
        const template = "ÅÅÅÅMMDD-XXXX"
        if (input.length <= 8) {
            return input + template.slice(input.length);
        }

        return input.slice(0, 8) + "-" + input.slice(8) + "X".repeat(12 - input.length);
    }

    async function submit() {
        if (input.length !== 12) {
            return setError("Felaktigt personnummer");
        }

        const validationResult = await validate(input);
        if (!validationResult.data) {
            return setError(validationResult.message);
        }

        router.push("/checka-in/wristband?ssn=" + input);
    }

    function backspace() {
        if (input.length > 0) setInput(input.slice(0, input.length - 1))
    }

    function hInput(value: string) {
        if (input.length < 12) setInput(input + value);
    }

    return (
        <>
            <div className="w-full flex justify-center items-center">
                <input className="text-4xl w-fit p-4 text-center text-white" type="text" value={inputToPersonnummer()} readOnly onKeyDown={(e) => {
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
