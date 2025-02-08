'use client';

import { useState } from "react";
import NumpadInput from "./NumpadInput";

export default function ArmbandsnummerInput() {
    const [input, setInput] = useState("");

    function inputToPersonnummer(inp: string): string {
        const template = "ÅÅÅÅMMDD-XXXX"
        if (inp.length <= 8) {
            return inp + template.slice(inp.length);
        }

        return inp.slice(0, 8) + "-" + inp.slice(8) + "X".repeat(12 - inp.length);
    }

    return (
        <>
            <div className="w-full flex justify-center items-center">
                <input className="text-4xl w-fit p-4 text-center text-white" type="text" value={inputToPersonnummer(input)} readOnly />
            </div >
            <div className="w-full flex justify-center items-center">
                <NumpadInput onNumber={(value: string) => {
                    if (input.length < 12) setInput(input + value);
                } } onDelete={function (): void {
                    if (input.length > 0) setInput(input.slice(0, input.length - 1))
                } } />
            </div>
        </>
    );
}
