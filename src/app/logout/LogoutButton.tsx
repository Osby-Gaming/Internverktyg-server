"use client";

import { logoutAccount } from "@/lib/appwrite";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
    const router = useRouter();

    return (
        <button onClick={() => {
            logoutAccount();
            router.push('/login');
        }}>Ja</button>
    )
}