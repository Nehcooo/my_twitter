'use client'
import Link from "next/link";
import { useEffect, useState } from "react";

type Hashtag = {
    id: number;
    name: string;
    created_at: Date;
}

export default function Trends() {

    const [hashtags, setHashtags] = useState<Hashtag[]>([]);

    const getRandomHashtags = (hashtags: any) => {
        const shuffled = [...hashtags].sort(() => Math.random() - 0.5);
        return shuffled.slice(0, 5);
    };

    const randomHashtags = getRandomHashtags(hashtags);

    useEffect(() => {
        const getHashtag = async () => {
            try {
                const res = await fetch(`/api/tweet/hashtag?hashtag=all`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error('Erreur lors de la récupération des données tweet :');
                }

                const data = await res.json();
                setHashtags(data.hashtags)
                console.log("hashtag : ", data);
            } catch (error) {
                console.log("Erreur lors de la récupération des données tweet : ", error);
            } finally {

            }
        };

        getHashtag();
    }, []);

    return (

        <div className="w-[95%] m-auto bg-(--secondary) rounded-xl flex flex-col items-center">
            <div className="mt-10 pb-10 flex flex-col items-flex-start w-[85%]">
                <p className="text-(--text-primary) text-2xl font-bold">Tendances pour vous</p>

                <div className="mt-10">

                    {randomHashtags.map((element, index) => {
                        return (
                            <Link href={`/hashtag/${element.name}`} key={index} className="border-b-2 border-(--border-grey-light) w-[100%] h-auto flex items-center justify-between bt-1 pb-3 pt-3 hover:bg-(--border-grey-light) duration-100 ease-in cursor-pointer">
                                <div className="flex flex-col items-flex-start ml-2">
                                    <p className="text-(--text-primary) text-md font-semi-bold">#{element.name}</p>
                                    <p className="text-xs mt-0 text-(--text-grey) overflow-hidden">{element.count} Tweets</p>
                                </div>

                                <span className="material-icons-outlined !text-[22px] mr-1 text-(--text-grey)">chevron_right</span>
                            </Link>
                        );
                    })}

                    <div className="mt-3">
                        <Link href={'/hashtag'} className=" text-(--blue) hover:underline">Voir tous les hashtag</Link>
                    </div>
                </div>
            </div>
        </div>
    )
}