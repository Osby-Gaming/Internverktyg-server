import { Models } from "appwrite";
import ItemInteractive from "./ItemInteractive";

export default function Item({ data, onClick }: { data: Models.Document, onClick: () => void }) {
    return (
        <div key={data.$id}>
            <div className="w-[11vw] h-[35vh]">
                <button className="relative w-full h-[11vw] flex justify-center items-center bg-kiosk_item_background rounded-3xl shadow-xl">
                    <img src={data.thumbnail_url} alt={data.name} className="object-scale-down w-[9vw] h-[9vw]" />
                    <p className="absolute font-bold text-lg bottom-0 bg-[#151515] text-center w-full py-0.5 rounded-3xl">
                        {data.price} kr
                    </p>
                    <ItemInteractive onClick={onClick} />
                </button>
                <p className="text-center text-xl font-semibold mt-4">{data.name}</p>
            </div>
        </div>
    )
}