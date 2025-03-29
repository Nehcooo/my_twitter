
export default function SkeletonTweet() {

    return (
        <>
            <div className="w-full h-auto py-5 mt-5 bg-(--secondary) rounded-xl flex items-start justify-center">
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
        </>
    )
}