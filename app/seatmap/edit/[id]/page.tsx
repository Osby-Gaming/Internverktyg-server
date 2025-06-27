import { MapLayoutInput } from "@/lib/seatmap/types";
import Map from "./map";
import { getRoomMapLayout } from "@/lib/appwrite_server";

export default async function Page({
    params
  }: {
    params: Promise<{ id: string }>
  }) {
    const id = (await params)["id"];
    let mapLayout: MapLayoutInput = {"x":76,"y":33,highestSeatNumber:0,"cells":["706",{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},"64",{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},"64",{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},"64",{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},"64",{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},{"type":"aisle"},"64",{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},{"type":"wall"},"1410"]};

    const lockedCells = [];

    if (id !== "new") {
        const roomRes = await getRoomMapLayout(id, true);

        if (!roomRes || roomRes.status !== 200 || !roomRes.data) {
            return <div className="text-red-500">Det gick inte att ladda rummet: {roomRes?.message || "Okänt fel"}</div>;
        }

        mapLayout = roomRes.data[0];
        lockedCells.push(...roomRes.data[1]);
    }

    return (
        <Map mapLayout={mapLayout} id={id} lockedCells={lockedCells}></Map>
    );
}