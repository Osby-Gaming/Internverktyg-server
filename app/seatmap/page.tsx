import Client from "./client";

export default async function Page() {
    return (
        <div>
            <h1 className="text-6xl mb-8 font-bold select-none">KASSA</h1>
            <Client></Client>
        </div>
    );
}
