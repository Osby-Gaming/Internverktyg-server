import Link from "next/link";

export default function Page() {
  return (
    <div>
      <div className="md:hidden lg:grid grid-cols-3 grid-rows-2">
        <Link href={"/kiosk"} className="row-span-1 lg:h-[240px] lg:w-[240px] h-[180px] w-[180px] flex justify-center items-center bg-gray-900 rounded-3xl m-1 cursor-pointer text-2xl select-none">Kiosk</Link>
        <Link href={"/checka-in"} className="row-span-1 lg:h-[240px] lg:w-[240px] h-[180px] w-[180px] flex justify-center items-center bg-gray-900 rounded-3xl m-1 cursor-pointer text-2xl select-none">Entré</Link>
        <div className="row-span-1 lg:h-[240px] lg:w-[240px] h-[180px] w-[180px] flex justify-center items-center bg-gray-900 rounded-3xl m-1 cursor-pointer text-2xl select-none"></div>
        <div className="row-span-1 lg:h-[240px] lg:w-[240px] h-[180px] w-[180px] flex justify-center items-center bg-gray-900 rounded-3xl m-1 cursor-pointer text-2xl select-none"></div>
        <div className="row-span-1 lg:h-[240px] lg:w-[240px] h-[180px] w-[180px] flex justify-center items-center bg-gray-900 rounded-3xl m-1 cursor-pointer text-2xl select-none"></div>
        <Link href={"/logout"} className="row-span-1 lg:h-[240px] lg:w-[240px] h-[180px] w-[180px] flex justify-center items-center bg-gray-900 rounded-3xl m-1 cursor-pointer text-2xl select-none">Logga ut</Link>
      </div>
      <div className="md:block lg:hidden grid-cols-2 grid-rows-3">
      <p>no</p>
      </div>
    </div>
  );
}
