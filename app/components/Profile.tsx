"use client";

import { userFollow } from "@/lib/userFollow";
import { UserProfile } from "@/app/types/user";

import Link from "next/link";
import { useUser } from "../ClientLayout";
import { useEffect, useState } from "react";

export default function Profile() {
    const { userId } = useUser();

    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [mostFollowed, setMostFollowed] = useState<UserProfile[] | []>([]);

    useEffect(() => {
        fetch("/api/profile", { method: "GET" })
            .then(res => res.json())
            .then(data => setMostFollowed(data));
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

    const { data: following, isLoading: isLoadingFollow } = userFollow(userData?.id ? userData?.id : null, "following");
    const { data: followers, isLoading: isLoadingFollowers } = userFollow(userData?.id ? userData?.id : null, "followers");

    return (
        <>
            <div className="h-[410px] relative w-[95%] m-auto bg-(--secondary) rounded-xl flex flex-col items-center overflow-hidden">
                <img
                    className="h-[100px] w-full object-cover"
                    src={userData?.banner ? userData.banner : "/img/default-banner.avif"}
                />
                <img
                    className="absolute top-15 h-[70px] w-[70px] rounded-full object-cover"
                    src={userData?.icon ? userData.icon : "/img/default_user_icon.png"}
                />

                <div className="relative top-10 w-[90%] text-center">
                    <p className="font-semibold text-xl mt-1 text-(--text-primary)">{userData?.lastname} {userData?.firstname}</p>
                    <p className="text-sm mt-0 text-(--text-grey)">@{userData?.username}</p>
                    <p className="text-sm mt-1 text-(--text-primary)">{userData?.bio}</p>
                </div>

                <div className="h-[90px] relative top-15 w-[100%] border-t-2 border-b-2 border-(--border-grey-light) flex items-center justify-between">
                    <Link href={`/profiles/${userData?.username}/following/`} className="h-[100%] w-[50%] flex flex-col items-center justify-center">
                        <p className="text-(--text-primary)">{following.length}</p>
                        <p className="text-sm mt-0 text-(--text-grey)">Abonnements</p>
                    </Link>

                    <div className="h-[50%] border-1 border-(--border-grey-light)">

                    </div>

                    <Link href={`/profiles/${userData?.username}/followers/`} className="h-[100%] w-[50%] flex flex-col items-center justify-center">
                        <p className="text-(--text-primary)">{followers.length}</p>
                        <p className="text-sm mt-0 text-(--text-grey)">Abonnés</p>
                    </Link>
                </div>

                <Link href={`/profiles/${userData?.username}`} className="hover:opacity-70 duration-100 ease-in flex items-center justify-center w-[75%] text-white bg-(--blue) cursor-pointer relative top-20 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                    <span className="material-icons-outlined !text-[18px] mr-1">person</span>
                    Mon profile
                </Link>
            </div>

            <div className="mt-5 h-auto w-[95%] m-auto bg-(--secondary) rounded-xl overflow-scroll">
                <div className="ml-5 h-auto flex flex-col gap-0 items-start justify-center">
                    <p className="ml-2 text-(--text-primary) text-2xl font-bold mt-5">Les plus suivis</p>

                    {mostFollowed.map((element, index) => (
                        <Link href={`/profiles/${element?.username}`} key={index} className="flex py-4 gap-5 items-center border-b-1 border-(--border-grey-light) last:border-0 cursor-pointer hover:opacity-80 p-2 justify-between w-[95%]">
                            <div className="flex items-center gap-5">
                                <img
                                    className="relative h-[40px] w-[40px] rounded-full object-cover"
                                    src={element?.icon ? element.icon : "/img/default_user_icon.png"}
                                />

                                <div className="flex flex-col w-[90%]">
                                    <p className="font-semibold text-md mt-1 text-(--text-primary)">{element?.lastname} {element?.firstname}</p>
                                    <p className="text-sm mt-0 text-(--text-grey)">@{element?.username}</p>
                                </div>
                            </div>

                            <p className="max-xl:hidden bg-(--light-grey-bg) flex items-center justify-center w-[100px] text-sm h-[30px] text-white rounded-full">{element.followed_count} abonnées</p>
                            <span className="xl:!hidden w-auto text-sm h-[30px] text-white material-icons-outlined">chevron_right</span>
                        </Link>
                    ))}
                </div>
            </div>
        </>
    )
}