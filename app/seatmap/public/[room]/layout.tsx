export default function RoomLayout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
    return (
        <div className="flex items-center justify-center h-[calc(100%-5rem)] w-full" id="seatmap_area">
            { children }
        </div>
    )
}