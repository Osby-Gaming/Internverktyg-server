'use client';

import { getKioskPurchase } from "@/lib/appwrite_client";
import { CheckoutItem } from "@/lib/types";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Receipt } from "@/lib/receipt"
import Link from "next/link";

export default function Page() {
    const searchParams = useSearchParams();
    const router = useRouter();

    const id = searchParams.get('id');

    if (!id) {
        router.push('/kiosk');

        return;
    }
    useEffect(() => {
        (async () => {
            const purchaseReq = await getKioskPurchase(id);

            if (purchaseReq.data === null) {
                router.push('/kiosk');
                return;
            }

            const itemIdToSubtractionIndex: Record<string, number> = {};

            for (let voucher of purchaseReq.data.kioskVouchers) {
                if (!itemIdToSubtractionIndex[voucher.kioskItem.$id]) {
                    itemIdToSubtractionIndex[voucher.kioskItem.$id] = voucher.kioskItem.price;
                } else {
                    itemIdToSubtractionIndex[voucher.kioskItem.$id] += voucher.kioskItem.price;
                }
            }

            let markdown = "^^^Kvitto\n\n"

            const date = new Date(+purchaseReq.data.timestamp);

            markdown += `${date.getFullYear().toString()}-${date.getMonth()}-${date.getDate()}, ${date.getHours()}:${date.getMinutes()}:${date.getMilliseconds()}\n`

            const items = JSON.parse(purchaseReq.data.items_json) as CheckoutItem[];

            for (let item of items) {
                markdown += `${item.name} | ${item.amount}| ${(item.amount * item.price).toLocaleString()} kr\n`

                if (itemIdToSubtractionIndex[item.$id]) {
                    markdown += `| Rabatt | -${itemIdToSubtractionIndex[item.$id].toLocaleString()} kr\n`
                }
            }

            markdown += `---\n^SUMMA | ^${purchaseReq.data.total.toLocaleString()} kr`

            const receipt = Receipt.from(markdown, '-c 42 -l en');
            //@ts-expect-error
            const svg: string = await receipt.toSVG();

            const el = document.getElementById('svg');

            if (el) {
                el.innerHTML = svg;
            }
            //@ts-expect-error
            const png: string = await receipt.toPNG();

            const downloadButton = document.getElementById('downloadButton');

            if (downloadButton) {
                downloadButton.onclick = () => {
                    const link = document.createElement('a');
                    link.href = png;
                    link.download = 'kvitto.png';
                    link.click();
                }
            }
        })()
    }, []);
    return (
        <div>
            <div className="bg-white" id="svg"></div>
            <div className="flex mt-4 items-center justify-center">
                <Link href={"/kiosk"}><button>GÅ TILLBAKA</button></Link>
                <button className="ml-4" id="downloadButton">LADDA NER</button>
            </div>
        </div>
    );
}
