import Map from "./map";
import { getRoomMapLayout } from "@/lib/util";

export default async function Page({
    params,
    searchParams
}: {
    params: Promise<{ id: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const id = (await params)["id"];
    const accessKey = (await searchParams)["access_key"];

    if (Array.isArray(accessKey)) {
        return <div className="text-red-500">Ogiltig accessnyckel</div>;
    }

    const roomRes = await getRoomMapLayout(id, false, accessKey);

    if (!roomRes || roomRes.status !== 200 || !roomRes.data) {
        return <div className="text-red-500">Det gick inte att ladda rummet: {roomRes?.message || "Okänt fel"}</div>;
    }

    let mapLayout = roomRes.data;

    return (
        <Map mapLayout={mapLayout} id={id}></Map>
    );
}