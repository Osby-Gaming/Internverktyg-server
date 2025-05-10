'use client';
import { getWristband, placeKioskPurchase } from "@/lib/appwrite_client";
import { CartData, PaymentMethodEnum, VoucherInstructions } from "@/lib/types";
import { generateVoucherInstructions, getAgeFromSSN } from "@/lib/util";
import { faMinus, faPlus } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Page() {
    const [selectedPayment, setSelectedPayment] = useState<PaymentMethodEnum>('swish');
    const [sellAnywaysChecked, setSellAnywaysChecked] = useState(false);
    const [age, setAge] = useState(15);
    const [useVouchers, setUseVouchers] = useState(false);
    const [cart, setCart] = useState<null | CartData>(null);
    const [instructions, setInstructions] = useState<VoucherInstructions>({
        use_vouchers: [],
        subtract: 0
    });
    const [customPaymentNote, setCustomPaymentNote] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const router = useRouter();

    useEffect(() => {
        const cart: CartData = JSON.parse(localStorage.getItem("cart") ?? '{}');

        if (!cart || !cart.items?.length || !cart.name?.length || !cart.phone_number?.length || !cart.ssn?.length || !cart.wristband_number) {
            router.replace('/kiosk');

            return;
        }

        setCart(cart);

        setAge(getAgeFromSSN(cart.ssn));

        setInstructions(generateVoucherInstructions(cart.items, cart.vouchers));
    }, [])

    const is15 = age >= 15;

    const hasAgeLimitedItems = !!(cart?.items.reduce((a, current) => a + (current.age_restricted_15 ? 1 : 0), 0));

    return (
        <div>
            <div className="flex">
                <div className="w-[58rem] h-[40rem]">
                    <div className="flex mb-10">
                        <h1 className="mr-4 text-6xl font-bold">BETALA</h1>
                        <div className="relative">
                            <h3 className="text-2xl font-thin thin-text absolute bottom-0 whitespace-nowrap">Armbandsnummer: {cart?.wristband_number}</h3>
                        </div>
                        <h3 className="text-2xl font-thin thin-text whitespace-nowrap invisible">Armbandsnummer: {cart?.wristband_number}</h3>
                        <div className="w-[calc(58rem-1rem-216px-260px)]"></div>
                    </div>
                    <div className="flex mb-2 pl-8">
                        <h3 className="text-3xl font-thin thin-text whitespace-nowrap italic">
                            Betalningsmetod:
                        </h3>
                    </div>
                    <div className="radio">
                        <label>
                            <span className="checkmark"></span>
                            <input type="radio" value="swish"
                                checked={selectedPayment === 'swish'}
                                onChange={() => setSelectedPayment('swish')} />
                            <p>Swish</p>
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <span className="checkmark"></span>
                            <input type="radio" value="cash"
                                checked={selectedPayment === 'cash'}
                                onChange={() => setSelectedPayment('cash')} />
                            <p>Kontanter</p>
                        </label>
                    </div>
                    <div className="radio">
                        <label>
                            <span className="checkmark"></span>
                            <input type="radio" value="custom"
                                checked={selectedPayment === 'custom'}
                                onChange={() => setSelectedPayment('custom')} />
                            <p>Specifierad: </p>
                            <input disabled={selectedPayment !== 'custom'} onChange={e => setCustomPaymentNote(e.target.value)} type="text" className="ml-4 h-5 rounded-none pl-1" />
                        </label>
                    </div>
                    <br />
                    <label className="form-control flex w-[50%]">
                        <input type="checkbox" name="checkbox-checked" checked={useVouchers} onChange={(event) => setUseVouchers(event.target.checked)} />
                        <p className="text-xl select-none ml-4">Använd vouchers</p>
                    </label>
                    <div className="flex mt-10 mb-5 pl-8">
                        <h3 className="text-3xl font-thin thin-text whitespace-nowrap italic">
                            Personuppgifter:
                        </h3>
                    </div>
                    <div className="flex w-full mb-5 pl-8">
                        <h5 className="w-[50%] text-xl">Namn</h5>
                        <p className="w-[40%] text-xl ellipsis">{cart?.name}</p>
                    </div>
                    <div className="flex w-full mb-5 pl-8">
                        <h5 className="w-[50%] text-xl">Allergier</h5>
                        <p className="w-[40%] text-xl ellipsis">{cart?.allergies}</p>
                    </div>
                    <div className="flex w-full mb-5 pl-8">
                        <h5 className="w-[50%] text-xl">Ålder</h5>
                        <p className="w-[40%] text-xl ellipsis">{age} <span className="text-red-600 font-bold select-none" hidden={is15}>(UNDER 15!)</span></p>
                    </div>
                    <div className="flex w-full mb-5 pl-8">
                        <h5 className="w-[50%] text-xl">Bord</h5>
                        <p className="w-[40%] text-xl ellipsis">{cart?.seat}</p>
                    </div>
                        <p className="mt-10 text-xl text-red-500">{error}</p>
                </div>
                <div className="w-[30rem]">
                    <div className="relative h-[90%]">
                        <div className="absolute z-10 w-full h-full bg-[#181818] rounded-3xl">
                            <ul>
                                {cart === null ? '' : cart.items.map(item => (
                                    <li key={item.$id} className="flex p-4">
                                        <button style={{
                                            all: 'unset'
                                        }}>
                                            <FontAwesomeIcon icon={faMinus} size="xl" className={"mr-3 text-red-400 cursor-not-allowed"} />
                                        </button>
                                        <button style={{
                                            all: 'unset'
                                        }}>
                                            <FontAwesomeIcon icon={faPlus} size="xl" className={"text-teal-200 cursor-not-allowed"} />
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="absolute z-20 h-full w-[25rem] right-0 px-10 bg-[#262626] min-height-[90vh] rounded-3xl">
                            <ul className="list-disc">
                                {cart === null ? '' : cart.items.map(item => (
                                    <li key={item.$id} className="flex py-4">
                                        <p className="w-[84%] text-ellipsis whitespace-nowrap overflow-hidden font-bold">{item.amount}x {item.name}</p>
                                        <p className="w-[16%] font-bold">{item.price * item.amount} kr</p>
                                    </li>
                                ))}
                            </ul>
                            <div>
                                <h5 className="bottom-0 absolute mb-5 font-bold text-2xl left-5">SUMMA: </h5>
                                <p className="bottom-0 right-5 absolute mb-5 font-bold text-2xl">{(cart?.items.reduce((acc, curr) => acc + (curr.price * curr.amount), 0) ?? 0) - (useVouchers ? instructions.subtract : 0)} kr</p>
                            </div>
                        </div>
                    </div>
                    <div className={!is15 && hasAgeLimitedItems ? 'flex mt-4' : 'mt-4 invisible'}>
                        <h4 className="text-red-600 text-xl font-bold w-[50%] select-none">
                            (UNDER 15!)
                        </h4>
                        <label className="form-control flex w-[50%]">
                            <p className="text-xl mr-4 select-none">Sälj ändå</p>
                            <input type="checkbox" name="checkbox-checked" checked={sellAnywaysChecked} onChange={(event) => setSellAnywaysChecked(event.target.checked)} disabled={(() => is15)()} />
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex mt-6">
                <div className="w-[58rem]"></div>
                <button className="text-3xl font-bold bg-[#151515] h-12 shadow-xl mr-16" onClick={() => router.push('/kiosk')}>GÅ TILLBAKA</button>
                <button className="text-3xl font-bold h-12 shadow-xl" onClick={async () => {
                    if (!cart) {
                        return;
                    }
                    if (!sellAnywaysChecked && hasAgeLimitedItems && !is15) {
                        return;
                    }
                    const wristbandReq = await getWristband(cart.wristband_number, ['$id'])

                    if (wristbandReq.data === null) {
                        setError(wristbandReq.message);

                        return;
                    }

                    const wristbandID = wristbandReq.data.$id;

                    const purchaseReq = await placeKioskPurchase(cart.items, wristbandID, selectedPayment, customPaymentNote, (useVouchers ? instructions : { use_vouchers: [], subtract: 0 }));

                    if (purchaseReq.data === null) {
                        setError(purchaseReq.message);

                        return;
                    }

                    localStorage.removeItem("cart");

                    router.push('/kiosk/receipt?id=' + purchaseReq.data.$id);
                }} disabled={(() => {
                    if (!hasAgeLimitedItems) {
                        return false;
                    }
                    if (!sellAnywaysChecked && !is15) {
                        return true;
                    }
                    return false;
                })()}>GODKÄNN</button>
            </div>
        </div>
    );
}
