import { useState, useEffect } from "react"
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { AiOutlineRetweet } from "react-icons/ai";
import { useUser } from "../../ClientLayout";

import TweetProps from "@/app/types/tweet";
import TweetActions from "@/app/components/tweet/TweetActions";

declare module "react" {
    interface HTMLAttributes<T> {
       cantweetclick?: string;
   }

}

export default function Tweets({ page, refreshTweets, hashtag }: { page: ("home" | "profile_tweet" | "profile_retweet" | "profile_quote" | "profile_like" | "hashtag"), refreshTweets: number | null | undefined, hashtag: string | null | undefined }) {
    const { userId } = useUser();

    const router = useRouter()
    const params = useParams<{ username: string }>();
    const username = params?.username;

    const [tweets, setTweets] = useState<TweetProps[] | []>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [disableTweet, setDisableTweet] = useState<boolean>(false);
    const [tweetOptions, setTweetOptions] = useState<number | null | undefined>(null);

    useEffect(() => {
        fetchUserTweets();
    }, [page, refreshTweets]);

    const fetchUserTweets = async () => {
        try {
            const res = await fetch(`/api/tweet?page=${page}&username=${username}&hashtag=${hashtag}`, {
                method: "GET",
                credentials: "include",
            });

            if (!res.ok) {
                throw new Error('Erreur lors de la récupération des données tweet :');
            }

            const data = await res.json();
            console.log("tweet : ", data);
            setTweets(data);
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

    const handleDelete = async (id: number | null | undefined) => {
        await fetch(`/api/tweet`, {
            method: "DELETE",
            body: JSON.stringify({
                tweetId: id,
            })
        });

        fetchUserTweets();
    }

    const handleTweetClick = (e: any, id: number | undefined) => {
        if (!disableTweet && e.target.getAttribute("cantweetclick") == "true") {
           router.push(`/tweet/${id}`)
        }
    }

    return (
        <>
            {tweets.map((tweet, index) => {
                let element = tweet;
                let isRetweet = (element.type == "retweet");

                if (isRetweet && element.parent) {
                    element = element.parent;
                }

                return (
                    <div key={index} cantweetclick="true" onClick={(e) => handleTweetClick(e, tweet.tweet_id)} className="cursor-pointer relative w-full h-auto px-10 py-5 mt-5 bg-(--secondary) rounded-xl flex items-start">
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
                                className={`${isRetweet && "mt-3"} rounded-full w-[60px] h-[60px] p-1 hover:opacity-90 object-cover`}
                                src={element.user?.icon ? element.user.icon : "/img/default_user_icon.png"}
                                alt="avatar"
                            />
                        </Link>

                        <div className={`${isRetweet && "mt-3"} flex flex-col items-start justify-start w-[80%] ml-5`}>
                            <div className="w-full relative flex items-center gap-1">
                                <Link href={`/profiles/${element.user?.username}`} className="hover:underline cursor-pointer"><span className="name">{element.user?.lastname} {element.user?.firstname} </span></Link>
                                <Link href={`/profiles/${element.user?.username}`} className="usersname text-[13px] text-(--text-grey)">
                                    @{element.user?.username}
                                </Link>

                                <div className="absolute right-0 flex flex-col items-center">
                                    {userId == element.user?.id && (
                                        <div className="text-(--text-grey)" onClick={() => setTweetOptions(tweetOptions == element.tweet_id ? null : element.tweet_id)}>
                                            <span className="material-icons-outlined">more_horiz</span>
                                        </div>
                                    )}

                                    {(tweetOptions == element.tweet_id) && (
                                        <div className="z-99 absolute flex items-center gap-2 top-5 w-auto h-auto p-1.5 bg-(--input) rounded-md">
                                            <div className="cursor-pointer hover:opacity-80 flex items-center justify-center">
                                                <span className="material-icons-outlined !text-[20px]">edit</span>
                                            </div>

                                            <div className="cursor-pointer hover:opacity-80 flex items-center justify-center" onClick={() => handleDelete(element.tweet_id)}>
                                                <span className="material-icons-outlined !text-[20px] text-red-500">delete</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <span cantweetclick="true" className="text-(--text-grey) text-xs mt-0">
                                {element.tweet_created_at && `${new Date(element.tweet_created_at).toLocaleDateString()}`}
                            </span>

                            <div cantweetclick="true" className="flex items-center justify-start h-auto break-all w-[100%] mt-3">
                                <p cantweetclick="true">{formatTextTweet(element.tweet)}</p>
                            </div>

                            {element.medias?.map((media, index) => {
                                if (media.type == "image") {
                                    return (
                                        <div cantweetclick="true" key={index} className="width-[72.5%] h-auto relative">
                                            <img cantweetclick="true" className="mt-5 rounded-lg max-w-[72.5%] max-md:max-w-full" src={media.url} />
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

                            <TweetActions disableTweet={(state: boolean) => setDisableTweet(state)} tweet={tweet} refresh={fetchUserTweets} />
                        </div>
                    </div>
                )
            })}
        </>
    )
}