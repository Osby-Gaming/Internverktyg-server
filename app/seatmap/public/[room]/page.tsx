import { redirect } from "next/navigation";
import RoomOne from "./room_one";
import RoomTwo from "./room_two";

export default async function Page({
    params,
    searchParams
  }: {
    params: Promise<{ room: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
  }) {
    const accessKey = (await searchParams)["access"];
    const room = (await params)["room"];

    if (!accessKey) {
      return redirect("/seatmap/public");
    }

    if (room === "0") {
        return (<RoomOne></RoomOne>);
    }
    if (room === "1") {
        return <RoomTwo></RoomTwo>;
    }

    redirect("/seatmap/public/0");
}