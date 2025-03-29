
export default function Skeleton() {

    return (
        <>
            <div className="w-[90%] md:w-[70%] min-h-[200px] m-auto bg-(--secondary) rounded-xl flex flex-col">
                <div>
                    <div className="w-full h-[200px] rounded-xl skeleton"></div>
                    <div className="w-[100px] h-[100px] rounded-full ml-10 -mt-[50px] skeleton"></div>
                </div>
                <div className="flex flex-col gap-5 mt-10 pb-10">
                    <div className="w-[220px] h-[20px] ml-10 rounded-lg skeleton"></div>
                    <div className="w-[220px] h-[20px] ml-10 rounded-lg skeleton"></div>
                    <div className="w-[220px] h-[20px] ml-10 rounded-lg skeleton"></div>
                </div>
            </div>

            <div className="w-[75%] m-auto">
                <div className="w-[90%] h-auto m-auto py-5 mt-5 bg-(--secondary) rounded-xl flex items-start justify-center">
                    <div className="w-[60px] h-[60px] rounded-full skeleton"></div>

                    <div className="flex flex-col items-start justify-start w-[80%] ml-5">
                        <div className="flex items-center gap-1">
                            <span className="w-[200px] h-[30px] skeleton rounded-xl"></span>
                        </div>

                        <div className="flex items-center justify-start h-auto break-all w-[100%] mt-3">
                            <p className="w-full h-[150px] skeleton rounded-xl"></p>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}