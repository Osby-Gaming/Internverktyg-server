import Seatmap from "@/lib/seatmap/react";

export default async function Page() {
    return (
        <Seatmap className="w-full h-[calc(100%-5rem)]" editMenuClassName="w-80 h-[calc(100%-5rem)]"></Seatmap>
    );
}
