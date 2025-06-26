import { MapLayoutInput } from "@/lib/seatmap/types";
import Map from "./map";
import { getRoomMapLayout } from "@/lib/util";

export default async function Page({
    params
  }: {
    params: Promise<{ id: string }>
  }) {
    const id = (await params)["id"];
    let mapLayout: MapLayoutInput = {"x":76,"y":33,"cells":["706",{"name":"706","type":"wall"},{"name":"707","type":"wall"},{"name":"708","type":"wall"},{"name":"709","type":"wall"},{"name":"710","type":"wall"},{"name":"711","type":"wall"},{"name":"712","type":"wall"},{"name":"713","type":"wall"},{"name":"714","type":"wall"},{"name":"715","type":"wall"},{"name":"716","type":"wall"},{"name":"717","type":"wall"},"64",{"name":"782","type":"aisle"},{"name":"783","type":"aisle"},{"name":"784","type":"aisle"},{"name":"785","type":"aisle"},{"name":"786","type":"aisle"},{"name":"787","type":"aisle"},{"name":"788","type":"aisle"},{"name":"789","type":"aisle"},{"name":"790","type":"aisle"},{"name":"791","type":"aisle"},{"name":"792","type":"aisle"},{"name":"793","type":"aisle"},"64",{"name":"858","type":"seat"},{"name":"859","type":"seat"},{"name":"860","type":"seat"},{"name":"861","type":"seat"},{"name":"862","type":"seat"},{"name":"863","type":"seat"},{"name":"864","type":"seat"},{"name":"865","type":"seat"},{"name":"866","type":"seat"},{"name":"867","type":"seat"},{"name":"868","type":"seat"},{"name":"869","type":"seat"},"64",{"name":"934","type":"seat"},{"name":"935","type":"seat"},{"name":"936","type":"seat"},{"name":"937","type":"seat"},{"name":"938","type":"seat"},{"name":"939","type":"seat"},{"name":"940","type":"seat"},{"name":"941","type":"seat"},{"name":"942","type":"seat"},{"name":"943","type":"seat"},{"name":"944","type":"seat"},{"name":"945","type":"seat"},"64",{"name":"1010","type":"aisle"},{"name":"1011","type":"aisle"},{"name":"1012","type":"aisle"},{"name":"1013","type":"aisle"},{"name":"1014","type":"aisle"},{"name":"1015","type":"aisle"},{"name":"1016","type":"aisle"},{"name":"1017","type":"aisle"},{"name":"1018","type":"aisle"},{"name":"1019","type":"aisle"},{"name":"1020","type":"aisle"},{"name":"1021","type":"aisle"},"64",{"name":"1086","type":"wall"},{"name":"1087","type":"wall"},{"name":"1088","type":"wall"},{"name":"1089","type":"wall"},{"name":"1090","type":"wall"},{"name":"1091","type":"wall"},{"name":"1092","type":"wall"},{"name":"1093","type":"wall"},{"name":"1094","type":"wall"},{"name":"1095","type":"wall"},{"name":"1096","type":"wall"},{"name":"1097","type":"wall"},"1410"]};

    if (id !== "new") {
        const roomRes = await getRoomMapLayout(id, true);

        if (!roomRes || roomRes.status !== 200 || !roomRes.data) {
            return <div className="text-red-500">Det gick inte att ladda rummet: {roomRes?.message || "Okänt fel"}</div>;
        }

        mapLayout = roomRes.data;
    }

    return (
        <Map mapLayout={mapLayout} id={id}></Map>
    );
}