"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { UserProfile } from "@/app/types/user";
import { useUser } from "../../ClientLayout";
import { AiOutlineRetweet } from "react-icons/ai";
import { IoMdArrowBack } from "react-icons/io";

import Image from "next/image";

import Link from "next/link";
import TweetProps from "@/app/types/tweet"
import TweetActions from "@/app/components/tweet/TweetActions";

export default function Tweet() {
    const { userId } = useUser();

    const router = useRouter();
    const params = useParams<{ id: string }>();
    const tweetId = params?.id;

    const [tweet, setTweet] = useState<TweetProps | null>(null);
    const [tweetReply, setTweetReply] = useState<TweetProps[] | []>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (tweetId) {
            fetchTweet();
        }
    }, [tweetId]);

    useEffect(() => {
        if (tweet) {
            fetchTweetReply();
        }
    }, [tweet]);

    const fetchTweet = async () => {
        try {
            const res = await fetch(`/api/tweet?page=tweet&tweetId=${tweetId}`, {
                method: "GET",
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la récupération des données tweet :');
            }

            const data = await res.json();

            setTweet(data[0]);
        } catch (error) {
            console.log("Erreur lors de la récupération des données tweet : ", error);
        } finally {
            setIsLoading(false);
        }
    }

    const fetchTweetReply = async () => {
        try {
            let element = tweet;
            let isRetweet = (tweet?.type == "retweet");

            if (isRetweet && tweet?.parent) {
                element = tweet.parent;
            }

            const res = await fetch(`/api/tweet?page=reply&tweetId=${element?.tweet_id}`, {
                method: "GET",
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la récupération des données tweet :');
            }

            const data = await res.json();

            setTweetReply(data);
        } catch (error) {
            console.log("Erreur lors de la récupération des données tweet : ", error);
        } finally {
            setIsLoading(false);
        }
    }

    const formatTextTweet = (text: string | null | undefined) => {
        return text?.split(/(@\w+|#\w+)/g).map((part, index) =>
        (part.startsWith("@") ? (
            <Link href={`/profiles/${part.replace("@", "")}`} key={index} className="text-(--blue)">{part}</Link>
        ) : part.startsWith("#") ? (
            <Link href={`/hashtag/${part.replace('#', '')}`} key={index} className="text-(--blue)">{part}</Link>
        ) : (
            part
        )
        ));
    }

    let element = tweet;
    let isRetweet = (tweet?.type == "retweet");

    if (isRetweet && tweet?.parent) {
        element = tweet.parent;
    }

    const handleTweetClick = (e: any, id: number | undefined) => {
        if (e.target.getAttribute("cantweetclick") == "true") {
           router.push(`/tweet/${id}`)
        }
    }

    return (
        <>
            <div className="relative w-[90%] [@media(min-width:987px)]:w-[50%] mx-auto h-auto">
                <div className="rounded-xl pt-2 pb-2 bg-(--secondary) flex items-center text-xl">
                    <div onClick={() => router.back()} className="cursor-pointer hover:opacity-80 flex items-center">
                        <IoMdArrowBack className="ml-5" />
                        <p className="ml-2">Retour</p>
                    </div>
                </div>

                <div className="pb-5 mt-5">
                    {(tweet && element) && (
                        <div className="relative w-full h-auto pt-5 pb-5 bg-(--secondary) rounded-xl flex items-start">
                            {isRetweet && (
                                <Link href={`/profiles/${tweet.user?.username}`} className="ml-10 absolute top-2 left-10 text-sm text-(--text-grey) font-bold flex items-center hover:underline cursor-pointer">
                                    <AiOutlineRetweet className="mr-2" />
                                    {userId != tweet.user?.id ? <span>{tweet.user?.lastname} {tweet.user?.firstname} a reposté</span> : <span>Vous avez reposté</span>}
                                </Link>
                            )}

                            <Link href={`/profiles/${element.user?.username}`}>
                                <Image
                                    width={200}
                                    height={200}
                                    className={`${isRetweet && "mt-3"} ml-10 rounded-full w-[60px] h-[60px] p-1 hover:opacity-90 object-cover`}
                                    src={element.user?.icon ? element.user.icon : "/img/default_user_icon.png"}
                                    alt="avatar"
                                />
                            </Link>

                            <div className={`${isRetweet && "mt-3"} flex flex-col items-start justify-start w-[80%] ml-5`}>
                                <div className="flex items-center gap-1">
                                    <Link href={`/profiles/${element.user?.username}`} className="hover:underline cursor-pointer"><span className="name">{element.user?.lastname} {element.user?.firstname} </span></Link>
                                    <Link href={`/profiles/${element.user?.username}`} className="usersname text-[13px] text-(--text-grey)">
                                        @{element.user?.username}
                                    </Link>
                                </div>

                                <span className="text-(--text-grey) text-xs mt-0">
                                    {element.tweet_created_at && `${new Date(element.tweet_created_at).toLocaleDateString()}`}
                                </span>

                                <div className="flex items-center justify-start h-auto break-all w-[100%] mt-3">
                                    <p cantweetclick="true">{formatTextTweet(element.tweet)}</p>
                                </div>

                                {element.medias?.map((media, index) => {
                                    if (media.type == "image") {
                                        return (
                                            <div key={index} className="width-[72.5%] h-auto relative">
                                                <img className="mt-5 rounded-lg max-w-[72.5%]" src={media.url} />
                                            </div>
                                        )
                                    } else if (media.type == "video") {
                                        return (
                                            <div key={index} className="width-[72.5%] h-auto relative">
                                                <video className="mt-5 rounded-lg max-w-[72.5%]" src={media.url} controls />
                                            </div>
                                        )
                                    }
                                })}

                                {(element.type == "reply" && element.parent) ? (
                                    <p className="mt-3 text-(--text-grey)">répond à</p>
                                ) : null}

                                {element.parent ? (
                                    <div onClick={() => router.push(`/tweet/${tweet.parent?.tweet_id}`)} className="pt-3 pb-3 mt-5 w-full h-auto border-2 border-(--border-grey-light) rounded-xl flex items-start cursor-pointer hover:opacity-80">
                                        <Image
                                            width={200}
                                            height={200}
                                            className="ml-3 rounded-full w-[40px] h-[40px] p-1 object-cover"
                                            src={element.parent.user?.icon ? element.parent.user?.icon : "/img/default_user_icon.png"}
                                            alt="avatar"
                                        />

                                        <div className="flex flex-col items-start justify-start w-[80%] ml-2">
                                            <div className="flex items-center gap-1">
                                                <span className="name">{element.parent.user?.lastname} {element.parent.user?.firstname} </span>
                                                <span className="usersname text-[13px] text-(--text-grey)">
                                                    @{element.parent.user?.username}
                                                </span>
                                            </div>

                                            <span className="text-(--text-grey) text-xs mt-0">
                                                {element.parent.tweet_created_at && `${new Date(element.parent.tweet_created_at).toLocaleDateString()}`}
                                            </span>

                                            <div className="flex items-center justify-start h-auto break-all w-[100%] mt-3">
                                                <p>{formatTextTweet(element.parent.tweet)}</p>
                                            </div>

                                            {element.parent.medias?.map((media: { type: string, url: string }, index: number) => {
                                                if (media.type == "image") {
                                                    return (
                                                        <div key={index} className="width-[72.5%] h-auto relative">
                                                            <img className="mt-5 rounded-lg max-w-[72.5%]" src={media.url} />
                                                        </div>
                                                    )
                                                } else if (media.type == "video") {
                                                    return (
                                                        <div key={index} className="width-[72.5%] h-auto relative">
                                                            <video className="mt-5 rounded-lg max-w-[72.5%]" src={media.url} controls />
                                                        </div>
                                                    )
                                                }
                                            })}
                                        </div>
                                    </div>
                                ) : null}
                            </div>
                        </div>
                    )}

                    <div className="mt-5 h-[1px] w-full bg-(--border-grey-light)"></div>

                    {tweet && (
                        <TweetActions disableTweet={null} tweet={tweet} refresh={fetchTweet} />
                    )}

                    <div className="mt-5 h-[1px] w-full bg-(--border-grey-light)"></div>

                    {tweetReply.map((element, index) => {
                        return (
                            <div key={index} cantweetclick="true" onClick={(e) => handleTweetClick(e, element.tweet_id)} className="cursor-pointer hover:opacity-70 relative w-full h-auto px-10 py-5 mt-5 bg-(--secondary) rounded-xl flex items-start">
                                <Link href={`/profiles/${element.user?.username}`}>
                                    <Image
                                        width={200}
                                        height={200}
                                        className={`rounded-full w-[60px] h-[60px] p-1 hover:opacity-90 object-cover`}
                                        src={element.user?.icon ? element.user.icon : "/img/default_user_icon.png"}
                                        alt="avatar"
                                    />
                                </Link>

                                <div className={`flex flex-col items-start justify-start w-[80%] ml-5`}>
                                    <div className="flex items-center gap-1">
                                        <Link href={`/profiles/${element.user?.username}`} className="hover:underline cursor-pointer"><span className="name">{element.user?.lastname} {element.user?.firstname} </span></Link>
                                        <Link href={`/profiles/${element.user?.username}`} className="usersname text-[13px] text-(--text-grey)">
                                            @{element.user?.username}
                                        </Link>
                                    </div>

                                    <span cantweetclick="true" className="text-(--text-grey) text-xs mt-0">
                                        {element.tweet_created_at && `${new Date(element.tweet_created_at).toLocaleDateString()}`}
                                    </span>

                                    <div cantweetclick="true" className="flex items-center justify-start h-auto break-all w-[100%] mt-3">
                                        <p>{formatTextTweet(element.tweet)}</p>
                                    </div>

                                    {element.medias?.map((media, index) => {
                                        if (media.type == "image") {
                                            return (
                                                <div cantweetclick="true" key={index} className="width-[72.5%] h-auto relative">
                                                    <img cantweetclick="true" className="mt-5 rounded-lg max-w-[72.5%]" src={media.url} />
                                                </div>
                                            )
                                        } else if (media.type == "video") {
                                            return (
                                                <div cantweetclick="true" key={index} className="width-[72.5%] h-auto relative">
                                                    <video cantweetclick="true" className="mt-5 rounded-lg max-w-[72.5%]" src={media.url} controls />
                                                </div>
                                            )
                                        }
                                    })}

                                    <TweetActions disableTweet={null} tweet={element} refresh={fetchTweetReply} />
                                </div>
                            </div>
                        )
                    }
                    )}
                </div>
            </div>

        </>
    )
}