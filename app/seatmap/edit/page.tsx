import { getAllRooms } from "@/lib/appwrite_server";
import Form from "./form";

export default async function Page() {
    const response = await getAllRooms();

    if (response.status !== 200 || !response.data) {
        return <div className="text-red-500">Det gick inte att ladda rum: {response.message}</div>;
    }

    return (
        <div className="w-screen h-[calc(100%-5rem)] relative">
            <div className="bg-black flex flex-col w-[40rem] h-96 p-10 absolute bottom-[calc(50%-12rem)] left-[calc(50%-20rem)]">
                <h1 className="text-white text-2xl mb-4 select-none">Redigera karta</h1>
                <div className="text-white mb-4 select-none">Välj ett rum att redigera:</div>
                <Form rooms={response.data as any[]}></Form>
            </div>
        </div>
    );
}