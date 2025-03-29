"use client";
import Link from "next/link";
import { FiExternalLink } from "react-icons/fi";
import { CiSearch } from "react-icons/ci";
import { useEffect, useState } from "react";

type Hashtag = {
    id: number;
    name: string;
    count: number;
    created_at: Date;
}

export default function Hashtag() {
    const [search, setSearch] = useState("");
    const [hashtags, setHashtags] = useState<Hashtag[]>([]);
    const [filteredHashtags, setFilteredHashtags] = useState<Hashtag[]>([]);

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
                setHashtags(data.hashtags);
                setFilteredHashtags(data.hashtags);
                console.log("hashtag : ", data);
            } catch (error) {
                console.log("Erreur lors de la récupération des données tweet : ", error);
            } finally {

            }
        };

        getHashtag();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const query = e.target.value;
        setSearch(query);

        if (query === "") {
            setFilteredHashtags(hashtags);
        } else {
            const filtered = hashtags.filter((hashtag) =>
                hashtag.name.toLowerCase().includes(query.toLowerCase())
            );
            setFilteredHashtags(filtered);
        }
    };

    return (

        <div className="w-[90%] [@media(min-width:987px)]:w-[50%] m-auto flex flex-col gap-8">
            <div className="w-[90%] m-auto py-6 flex items-center justify-start rounded-xl">
                <form>
                    <div className="relative w-full max-w-md">
                        <input
                            type="text"
                            placeholder="Rechercher..."
                            value={search}
                            onChange={handleChange}
                            className="w-full p-3 pl-10 bg-(--secondary) shadow-lg shadow-gray-800 placeholder:text-(--text-primary) text-white rounded-xl focus:ring-2 focus:ring-blue-500/50 focus:outline-none shadow-sm"
                        />
                        <CiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2  text-xl text-(--text-primary)" />
                    </div>
                </form>
            </div>

            {filteredHashtags.map((element, index) => {
                return (

                    <Link key={index} href={`/hashtag/${element.name} `} className="w-[90%] py-4 px-5 rounded-xl text-gray-300 m-auto flex items-center justify-between bg-(--secondary)">
                        <div className="flex flex-col gap-2">
                            <span className="text-(--text-primary)">{element.name}</span>
                            <span className="text-(--text-primary) text-[13px] text-left">{element.count} posts</span>
                        </div>
                        <button><FiExternalLink className="text-(--text-primary)" size={20} /></button>
                    </Link>
                );
            })}

        </div>
    )
}