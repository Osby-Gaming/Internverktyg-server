'use client';

import { faSquarePlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default function ItemInteractive({ onClick }: { onClick: () => void }) {
    return (
        <div className="absolute h-full w-full bg-green-600 opacity-0 hover:opacity-85 rounded-3xl flex justify-center items-center" onClick={onClick}>
            <FontAwesomeIcon icon={faSquarePlus} size="3x" />
        </div>
    )
}