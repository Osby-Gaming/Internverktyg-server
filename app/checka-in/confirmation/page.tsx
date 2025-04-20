import Link from "next/link";

export default function Page() {
    return (
        <div>
            <h1 className="text-7xl text-center mb-8">Klart! 🥳</h1>
            <div className="flex justify-center">
                <Link href="/checka-in">
                    <button className="text-xl">
                        GÅ TILLBAKA
                    </button>
                </Link>
            </div>
        </div>
    );
}
