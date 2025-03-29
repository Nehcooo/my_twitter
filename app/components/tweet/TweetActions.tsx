import { useEffect, useState } from "react";
import { FaXmark } from "react-icons/fa6";
import { GoPencil } from "react-icons/go";
import { UserProfile } from "@/app/types/user";
import { createPortal } from "react-dom";
import { uploadMedia } from "@/lib/api-image";
import { FaRegHeart, FaCommentDots, FaHeart } from "react-icons/fa";
import { AiOutlineRetweet } from "react-icons/ai";
import { useTheme, useUser } from "@/app/ClientLayout";

import Image from "next/image";
import TweetProps from "@/app/types/tweet"
import GifPicker from 'gif-picker-react';
import EmojiPicker from "emoji-picker-react";

interface Hashtag {
    id: number,
    name: string
}

const Quote = ({ userId, close, tweetType, tweetId, disableTweet }: { userId: number | null, close: any, tweetId: number, tweetType: string, disableTweet: any }) => {
    const { theme }: { theme: any } = useTheme();

    const [tweet, setTweet] = useState<string>("");
    const [medias, setMedias] = useState<{ type: string, file: string | null, url: string }[]>([]);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [filteredHashtags, setFilteredHashtags] = useState<Hashtag[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [hashtags, setHashtags] = useState<Hashtag[]>([]);
    const [showGifPicker, setShowGifPicker] = useState<boolean>(false);
    const [showEmojis, setShowEmojis] = useState<boolean>(false);

    useEffect(() => {
        if (disableTweet) {
            disableTweet(true);
        }

        return () => {
            if (disableTweet) {
                disableTweet(false);
            }
        }
    }, []);

    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 768);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
        };
    }, []);

    useEffect(() => {
        if (userId) {
            fetch("/api/users/userData?userId=" + userId, { method: "GET" })
                .then(res => res.json())
                .then(data => setUserData(data[0]));
        } else {
            setUserData(null);
        }
    }, [userId]);

    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

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

    const handleFileUpload = async () => {
        const input = document.createElement("input");

        input.type = "file";
        input.accept = "image/*,video/*";
        input.click();

        input.addEventListener("change", (e: any) => {
            const file = e.target.files[0];

            if (file) {
                const fileType = file.type.startsWith("image/") ? "image" : file.type.startsWith("video/") ? "video" : "unknown";
                const reader = new FileReader();

                reader.onload = (e: any) => {
                    setMedias(prevMedias => [...prevMedias, { type: fileType, file: file, url: e.target.result }]);
                }

                reader.readAsDataURL(file);
            }
        });
    }

    const resetImageFile = (id: number) => {
        setMedias(prevMedias => prevMedias.filter((_, index) => index != id));
    }

    const handlePostTweet = async () => {
        const newMedias = await Promise.all(medias.map(async (element) => {
            if (element.file) {
                const media = await uploadMedia(element.file);
                return { type: element.type, url: media.url };
            } else {
                return { type: element.type, url: element.url };
            }
        }));

        const getStringHashtagList = (text: string | null | undefined) => {
            let list: any[] = [];

            text?.split(/(@\w+|#\w+)/g).map(part => {
                if (part.startsWith("#")) {
                    list.push(part.replace("#", ""));
                }
            });

            return list;
        }

        if (tweet.length <= 0 && newMedias.length <= 0) {
            return;
        }

        await fetch("/api/home", {
            method: "POST",
            body: JSON.stringify({
                parentId: tweetId,
                type: tweetType,
                tweet: tweet,
                medias: newMedias,
                filteredHashtags: getStringHashtagList(tweet),
            }),
        });

        setTweet("");
        setMedias([]);
        close();
    }

    const handleClose = (e: any) => {
        const target: HTMLElement = e.target;

        if (target.id == "quote") {
            close();
        }
    }

	const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setTweet(value);

        const match = value.match(/#(\w*)$/);
        if (match) {
            const searchTerm = match[1].toLowerCase();
            if (searchTerm === "") {
                setFilteredHashtags(hashtags);
            } else {
                setFilteredHashtags(
                    hashtags.filter((tag) => tag.name.toLowerCase().startsWith(searchTerm))
                );
            }
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    }

    const handleSelectHashtag = (name: string) => {
        const updatedTweet = tweet.replace(/#\w*$/, `#${name} `);
        setTweet(updatedTweet);
        setShowSuggestions(false);
    }

    const onGifClick = (gif: any) => {
        setMedias((prev) => [
            ...prev,
            { type: "image", file: null, url: gif.url },
        ]);
        setShowGifPicker(false);
    }

    const onEmojiClick = (emoji: any) => {
        setTweet((prev) => prev + emoji.emoji);
    }

    return createPortal(
        <div id="quote" className="pointer-events-auto fixed top-0 h-screen w-screen bg-(--light-grey-bg) backdrop-blur-sm z-99 flex items-center justify-center" onClick={handleClose}>
            <div className="relative w-[80%] h-auto pt-5 pb-5 mb-0 bg-(--secondary) rounded-xl flex items-start">
                <div className="absolute right-5 ml-5 cursor-pointer hover:opacity-80 text-xl" onClick={() => close()}>
                    <FaXmark />
                </div>

                <Image
                    width={200}
                    height={200}
                    className="mt-8 ml-10 rounded-full w-[60px] h-[60px] p-1 object-cover"
                    src={userData?.icon ? userData.icon : "/img/default_user_icon.png"}
                    alt="avatar"
                />

                <div className="mt-8 relative flex flex-col items-start justify-start w-[80%] ml-5">
                    <textarea
                        onKeyDown={(e) => e.code == "Enter" && handlePostTweet()}
                        value={tweet}
                        onChange={handleChange}
                        placeholder={tweetType === "quote" ? "Ajouter un commentaire" : "Ajouter une réponse"} 
                        className="block w-[100%] max-xl:w-[90%] p-3 border border-[var(--border-input)] focus:outline-none rounded-lg bg-[var(--input)] text-[var(--text-primary)]"
                    />

                    {showGifPicker && (
                        <div className="mt-5 w-[90%] h-[500px]">
                            <GifPicker height="100%" width="auto" locale="fr-FR" country="FR" theme={theme ?? "light"} onGifClick={onGifClick} tenorApiKey="AIzaSyC-i3zYnHZu-0tpD4qcIOwsfBGcoNrfAzI" />
                        </div>
                    )}

                    {showEmojis && (
                        <div className="mt-5 w-[90%] h-[500px]">
                            <EmojiPicker height="100%" width="auto" onEmojiClick={onEmojiClick} theme={theme ?? "light"} />
                        </div>
                    )}

                    {showSuggestions && filteredHashtags.length > 0 && (
                        <ul className="absolute left-0 top-11 w-full border border-gray-300 shadow-md rounded-md mt-1 max-h-40 overflow-auto z-50 bg-(--secondary)">
                            {filteredHashtags.map((tag) => (
                                <li
                                    key={tag.id}
                                    className="p-2 bg-(--secondary) cursor-pointer hover:bg-gray-200"
                                    onClick={() => handleSelectHashtag(tag.name)}
                                >
                                    #{tag.name}
                                </li>
                            ))}
                        </ul>
                    )}

                    {medias.map((element, index) => {
                        if (element.type == "image") {
                            return (
                                <div key={index} className="width-[72.5%] h-auto relative">
                                    <div onClick={() => resetImageFile(index)} className="cursor-pointer absolute h-[35px] w-[35px] bg-(--light-grey-bg) right-3 top-3 rounded-full flex items-center justify-center">
                                        <span className="material-icons-outlined text-(--white) text-xs">close</span>
                                    </div>

                                    <img className="mt-5 rounded-lg max-w-[72.5%]" src={element.url} />
                                </div>
                            )
                        } else if (element.type == "video") {
                            return (
                                <div key={index} className="width-[72.5%] h-auto relative">
                                    <div onClick={() => resetImageFile(index)} className="cursor-pointer absolute h-[35px] w-[35px] bg-(--light-grey-bg) right-3 top-3 rounded-full flex items-center justify-center">
                                        <span className="material-icons-outlined text-(--white) text-xs">close</span>
                                    </div>

                                    <video className="mt-5 rounded-lg max-w-[72.5%]" src={element.url} controls />
                                </div>
                            )
                        }
                    })}

                    <div className="w-[100%] mt-5 flex flex-col justify-center">
                        <div className="flex flex-wrap items-center gap-2">
                            <button onClick={handleFileUpload} className="text-sm cursor-pointer flex items-center justify-center gap-2 text-(--text-primary) bg-transparent hover:opacity-50 font-semibold py-2 px-4 border-2 border-(--border-grey-light) rounded-full">
                                <span className="material-icons-outlined text-(--blue) text-xs">photo_library</span>
                                {isMobile ? (
                                    null
                                ) : (
                                    <>Joindre des médias</>
                                )}
                            </button>

                            <button
                                onClick={() => {
                                    setShowEmojis(false)
                                    setShowGifPicker(!showGifPicker)
                                }}
                                className="text-sm cursor-pointer flex items-center justify-center gap-2 text-[var(--text-primary)] bg-transparent hover:opacity-50 font-semibold py-2 px-4 border-2 border-[var(--border-grey-light)] rounded-full"
                            >
                                <span className="material-icons-outlined text-[var(--blue)] text-xs">
                                    gif_box
                                </span>
                                {isMobile ? (
                                    null
                                ) : (
                                    <>GIF</>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    setShowGifPicker(false)
                                    setShowEmojis(!showEmojis)
                                }}
                                className="text-sm cursor-pointer flex items-center justify-center gap-2 text-[var(--text-primary)] bg-transparent hover:opacity-50 font-semibold py-2 px-4 border-2 border-[var(--border-grey-light)] rounded-full"
                            >
                                <span className="material-icons-outlined text-[var(--blue)] text-xs">
                                    emoji_people
                                </span>
                                {isMobile ? (
                                    null
                                ) : (
                                    <>Emojis</>
                                )}
                            </button>

                            <button onClick={handlePostTweet} type="button" className="text-white cursor-pointer bg-(--blue) hover:opacity-70font-medium rounded-full text-sm text-center inline-flex hover:opacity-70  items-center gap-2 py-2 px-4 ">
                                <span className="material-icons-outlined text-(--white) text-xs">send</span>
                                {isMobile ? (
                                    null
                                ) : (
                                    <>Poster</>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}

export default function TweetActions({ tweet, refresh, disableTweet }: { tweet: TweetProps, refresh: any, disableTweet: any | null }) {
    const { userId } = useUser();

    const [retweetMenu, setRetweetMenu] = useState<number | null | undefined>(null);
    const [quote, setQuote] = useState<number | null | undefined>(null);
    const [reply, setReply] = useState<number | null | undefined>(null);

    let eventClick: any = null;

    useEffect(() => {
        if (eventClick) {
            window.removeEventListener("click", eventClick);
        }

        if (retweetMenu != null) {
            eventClick = window.addEventListener("click", (e) => {
                setRetweetMenu(null);

            });
        }
    }, [retweetMenu]);

    const handleLikeTweet = async (tweetId: number | undefined, liked: boolean | undefined) => {
        await fetch("/api/tweet/like", {
            method: "POST",
            body: JSON.stringify({
                tweetId: tweetId,
                isLiked: liked,
            }),
        });

        refresh();
    }

    const handleRetweet = async (tweetId: number | undefined, tweet: string | null) => {
        await fetch("/api/home", {
            method: "POST",
            body: JSON.stringify({
                parentId: tweetId,
                type: "retweet",
                tweet: tweet,
                medias: [],
            }),
        });

        refresh();
    }

    const handleUndoRetweet = async (tweetId: number | undefined) => {
        await fetch("/api/tweet/retweet", {
            method: "DELETE",
            body: JSON.stringify({
                tweetId: tweetId,
            }),
        });

        refresh();
    }

    let element = tweet;
    let isRetweet = (tweet?.type == "retweet");

    if (isRetweet && tweet?.parent) {
        element = tweet.parent;
    }

    return (
        <>
            <div className="flex flex-row gap-4 mt-5 w-full">
                <button onClick={() => handleLikeTweet(element.tweet_id, element.liked)} className="cursor-pointer hover:opacity-80 bg-(--input) text-sm rounded-md w-[100%] h-[40px] flex items-center justify-center">
                    {element.liked ? (
                        <>
                            <FaHeart className="mr-2 text-rose-500" />
                            <span className="text-rose-500 max-md:hidden">Like</span>
                        </>
                    ) : (
                        <>
                            <FaRegHeart className="mr-2" />
                            <span className="max-md:hidden">Like</span>
                        </>
                    )}

                    <span className="text-(--text-grey) md:ml-1"><span className="max-md:hidden">{"("}</span>{element.likes_count}<span className="max-md:hidden">{")"}</span></span>
                </button>

                <div className="relative w-[100%]">
                    <button id="retweetButton" onClick={() => setTimeout(() => { setRetweetMenu((retweetMenu == tweet.tweet_id) ? null : tweet.tweet_id) }, 10)} className="cursor-pointer hover:opacity-80 bg-(--input) text-sm rounded-md w-[100%] h-[40px] flex items-center justify-center">
                        {element.retweeted ? (
                            <>
                                <AiOutlineRetweet className="mr-2 text-(--green)" />
                                <span className="text-(--green) max-md:hidden">Retweet</span>
                            </>
                        ) : (
                            <>
                                <AiOutlineRetweet className="mr-2" />
                                <span className="max-md:hidden">Retweet</span>
                            </>
                        )}

                        <span className="text-(--text-grey) md:ml-1"><span className="max-md:hidden">{"("}</span>{element.retweet_count}<span className="max-md:hidden">{")"}</span></span>
                    </button>

                    {(retweetMenu == tweet.tweet_id) && (
                        <div className="z-99 absolute bottom-[-70px] w-auto h-auto p-2 bg-(--input) rounded-xl">
                            {!element.retweeted ? (
                                <div className="cursor-pointer hover:opacity-80 flex items-center" onClick={() => handleRetweet(element.tweet_id, null)}>
                                    <AiOutlineRetweet className="mr-2" />
                                    <p className="text-sm">Repost</p>
                                </div>
                            ) : (
                                <div className="cursor-pointer hover:opacity-80 flex items-center" onClick={() => handleUndoRetweet(element.tweet_id)}>
                                    <AiOutlineRetweet className="mr-2" />
                                    <p className="text-sm">Annuler le Repost</p>
                                </div>
                            )}

                            <div className="cursor-pointer hover:opacity-80 flex items-center mt-2" onClick={() => setQuote(element.tweet_id)}>
                                <GoPencil className="mr-2" />
                                <p className="text-sm">Citer</p>
                            </div>
                        </div>
                    )}
                </div>

                <button onClick={() => setReply(element.tweet_id)} className="cursor-pointer hover:opacity-80 bg-(--input) text-sm rounded-md w-[100%] h-[40px] flex items-center justify-center">
                    <FaCommentDots className="mr-2" />

                    <span className="max-md:hidden">Réponse</span>
                    <span className="text-(--text-grey) md:ml-1"><span className="max-md:hidden">{"("}</span>{element.reply_count}<span className="max-md:hidden">{")"}</span></span>
                </button>
            </div>

            {quote && <Quote disableTweet={disableTweet} tweetId={quote} tweetType="quote" userId={userId} close={() => setQuote(null)} />}
            {reply && <Quote disableTweet={disableTweet} tweetId={reply} tweetType="reply" userId={userId} close={() => setReply(null)} />}
        </>
    )
}