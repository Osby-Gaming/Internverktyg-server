import LayoutTopButtons from "./layout-top-buttons";

export default function SeatmapLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="w-screen h-screen">
            <div className="w-screen h-20 bg-seatmap_green flex justify-center items-center">
                <LayoutTopButtons />
            </div>
            { children }
        </div>
    )
}