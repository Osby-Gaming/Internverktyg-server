import Items from "./Items";

export default function Page() {
    return (
        <div className="flex">
            <div className="w-[60vw] height-[90vh]">
                <h1 className="text-6xl mb-8 font-bold">KASSA</h1>
                <div className="min-h-[75vh] overflow-x-scroll whitespace-nowrap overflow-visible">
                    <Items />
                </div>
            </div>
            <div className="w-[30vw] height-[90vh] bg-blue-200">lol</div>
        </div>
    );
}
