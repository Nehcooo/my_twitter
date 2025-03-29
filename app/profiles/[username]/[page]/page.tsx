"use client";

import Link from "next/link";
import Image from "next/image";
import { GoPersonAdd } from "react-icons/go";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { UserProfile } from "@/app/types/user";
import { userFollow } from "@/lib/userFollow";
import Profile from "@/app/components/Profile";
import Trends from "@/app/components/Trends";
import Header from "@/app/components/Header";

export default function FollowersPage() {
    const params = useParams<{ username: string }>();
    const username = params?.username;
    const pathname = usePathname();

    const [isLoading, setIsLoading] = useState(true);
    const [userData, setUserData] = useState<UserProfile | null>(null);

    useEffect(() => {
        if (!username) return;

        const fetchUserData = async () => {
            try {
                const res = await fetch(`/api/users/userData?page=${username}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error("Erreur lors de la récupération des données utilisateur");
                }

                const data = await res.json();
                setUserData(data[0]);
            } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur :", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [username]);

    const userId = userData?.id || null;
    const isFollowersPage = pathname.endsWith("/followers");
    const { data: usersList = [], isLoading: loadingUsers } = userFollow(userId, isFollowersPage ? "followers" : "following");

    return (
        <div className="w-[50%]">
            <div className="flex justify-between">
                <Link
                    className={`link ${isFollowersPage ? "active-link" : ""}`}
                    href={`/profiles/${username}/followers`}
                >
                    Followers
                </Link>

                <Link
                    className={`link ${!isFollowersPage ? "active-link" : ""}`}
                    href={`/profiles/${username}/following`}
                >
                    Following
                </Link>
            </div>

            {loadingUsers ? (
                <p>Chargement...</p>
            ) : (
                <ul className="flex flex-col gap-5 py-5">
                    {usersList.length > 0 ? (
                        usersList.map((user) => (
                            <li key={user.id} className="flex items-center gap-3 hover:opacity-75 bg-(--secondary) active:scale-[0.98] transition duration-150 ease-in-out rounded-lg">
                                <Link className="w-full h-full flex items-center justify-between px-8 py-4 p-2 gap-3" href={`/profiles/${user.username}`}>
                                    <div className="flex items-center gap-3">
                                        <Image
                                            src={user.icon || "/img/default_user_icon.png"}
                                            alt={user.username}
                                            width={40}
                                            height={40}
                                            className="w-10 h-10 rounded-full"
                                        />
                                        <span className="font-medium">{user.username}</span>
                                    </div>
                                    <GoPersonAdd size={25} />
                                </Link>
                            </li>
                        ))
                    ) : (
                        <p>Aucun {isFollowersPage ? "follower" : "following"}</p>
                    )}
                </ul>
            )}
        </div>

    );
}
