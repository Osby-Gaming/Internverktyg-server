import { redirect } from "next/navigation";
import RoomOne from "./room_one";
import RoomTwo from "./room_two";

export default async function Page({
    params,
  }: {
    params: Promise<{ room: string }>
  }) {
    let room = (await params)["room"];

    if (room === "0") {
        return (<RoomOne></RoomOne>);
    }
    if (room === "1") {
        return <RoomTwo></RoomTwo>;
    }

    redirect("/seatmap/0");
}