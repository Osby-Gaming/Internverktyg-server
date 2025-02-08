'use client';

export default function NumpadInput(props: { onNumber: (value: string) => void, onDelete: () => void }) {
    return (
        <div className="md:hidden lg:grid grid-cols-3 grid-rows-4 w-fit gap-[30px] mt-[60px]">
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("1")
            }}>1</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("2")
            }}>2</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("3")
            }}>3</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("4")
            }}>4</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("5")
            }}>5</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("6")
            }}>6</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("7")
            }}>7</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("8")
            }}>8</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("9")
            }}>9</div>
            <div className="col-span-2 lg:w-[210px] lg:h-[90px] w-[90px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onNumber("0")
            }}>0</div>
            <div className="row-span-1 lg:w-[90px] lg:h-[90px] w-[45px] h-[45px] flex justify-center items-center buttonGray rounded-[2rem] text-4xl cursor-pointer select-none" onClick={() => {
                props.onDelete();
            }}>Rm</div>
        </div>
    );
}
