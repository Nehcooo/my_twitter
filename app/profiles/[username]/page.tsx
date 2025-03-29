"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useUser } from "@/app/ClientLayout";
import Tabs from "@/app/components/profiles/tabs";
import EditModal from "@/app/components/profiles/editModal";
import Skeleton from "@/app/components/profiles/skeleton";
import { UserProfile } from "@/app/types/user";
import Header from "@/app/components/Header";
import { userFollow } from "@/lib/userFollow";
import Profile from "@/app/components/Profile";
import Trends from "@/app/components/Trends";
import { CiSettings } from "react-icons/ci";
import Setting from "@/app/components/profiles/settingModal";
import { FaLinkedinIn } from "react-icons/fa";
import { FaInternetExplorer } from "react-icons/fa6";
import { FiGithub } from "react-icons/fi";


export default function Profiles() {
    const params = useParams<{ username: string }>();
    const username = params?.username;
    const { userId } = useUser();

    const [isEdit, setIsEdit] = useState(false);
    const [isHover, setIsHover] = useState(false);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSetting, setIsSetting] = useState(false);
    const [isFollowing, setIsFollowing] = useState<boolean>(true);

    useEffect(() => {
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
                setIsLoading(false);
            } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur :", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [username]);

    useEffect(() => {
        const checkFollowStatus = async (followingUserId: number, followedUserId: number) => {
            try {
                const response = await fetch(`/api/users/follow?page=follow&following_user_id=${followingUserId}&followed_user_id=${followedUserId}`);
                const data = await response.json();

                if (data.isFollowing) {
                    setIsFollowing(true);
                    console.log('Vous suivez déjà cet utilisateur');
                } else {
                    setIsFollowing(false);
                    console.log('Vous ne suivez pas encore cet utilisateur');
                }
            } catch (error) {
                console.error("Erreur lors de la vérification du statut de suivi :", error);
            }
        };

        if (userId && userData?.id) {
            checkFollowStatus(userId, userData.id);
        }
    }, [userId, userData]);


    const followUser = async (followingUserId: number, followedUserId: number) => {
        try {
            const response = await fetch('/api/users/follow', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    following_user_id: followingUserId,
                    followed_user_id: followedUserId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Erreur lors du suivi de l\'utilisateur :', error);
        }
    };

    const unfollowUser = async (followingUserId: number, followedUserId: number) => {
        try {
            const response = await fetch('/api/users/follow', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    following_user_id: followingUserId,
                    followed_user_id: followedUserId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                console.log(data.message);
                setIsFollowing(false);
            } else {
                console.error(data.error);
            }
        } catch (error) {
            console.error('Erreur lors de l\'annulation du suivi de l\'utilisateur :', error);
        }
    };

    const { data: following, isLoading: isLoadingFollow } = userFollow(userData?.id ? userData?.id : null, "following");
    const { data: followers, isLoading: isLoadingFollowers } = userFollow(userData?.id ? userData?.id : null, "followers");


    if (isLoading) {
        return <Skeleton />;
    }

    if (!userData) {
        return <span>Aucune donnée trouvée.</span>;
    }

    return (
        <>

            {isEdit ? <EditModal onClose={() => setIsEdit(false)} /> : null}
            {isSetting ? <Setting onClose={() => setIsSetting(false)} /> : null}


            <div className="w-[80%] md:w-[50%] m-auto">
                <div className="bg-(--secondary) rounded-xl flex flex-col">
                    <div className="w-full max-h-[200px] rounded-xl overflow-hidden">
                        <Image
                            width={1584}
                            height={396}
                            className="w-full h-[full] object-cover"
                            src={userData.banner ? userData.banner : "/img/default-banner.avif"}
                            alt="Bannière utilisateur"
                        />
                    </div>

                    <div className="flex flex-row justify-between relative">
                        <div className="w-[80px] h-[80px] ml-[30px] mt-[-50px] rounded-full overflow-hidden">
                            <Image
                                width={200}
                                height={200}
                                className="w-full h-full object-cover"
                                src={userData.icon ? userData.icon : "/img/default_user_icon.png"}
                                alt="Avatar utilisateur"
                            />
                        </div>

                        <div className="absolute right-0 flex flex-col w-auto">
                            {userData.id == userId ? (
                                <div className="flex items-center gap-3">
                                    <button onClick={() => setIsSetting(true)} className="mt-3 hover:opacity-70 duration-100 ease-in flex items-center justify-center w-fit text-white bg-(--light-grey-bg) cursor-pointer relative top-5 right-5 font-medium rounded-full text-sm h-fit p-2 text-center">
                                        <CiSettings size={20} />
                                    </button>
                                    <button onClick={() => setIsEdit(true)} className="mt-3 hover:opacity-70 duration-100 ease-in flex items-center justify-center w-auto text-white bg-(--light-grey-bg) cursor-pointer relative top-5 right-5 font-medium rounded-full text-sm px-5 h-[40px] text-center">
                                        <span className="material-icons-outlined !text-[18px] mr-1">edit</span>
                                        Editer mon profile
                                    </button>
                                </div>
                            ) : (
                                <>
                                    {!isFollowing ? (
                                        <button
                                            id="follow"
                                            onClick={() => {
                                                if (userId !== null) {
                                                    followUser(userId, userData.id);
                                                    setIsFollowing(true);
                                                }
                                            }}
                                            className="mt-3 hover:opacity-70 duration-100 ease-in flex items-center justify-center w-auto text-white bg-(--light-grey-bg) cursor-pointer relative top-5 right-5 font-medium rounded-full text-sm px-5 h-[40px] text-center"
                                        >
                                            <span className="material-icons-outlined !text-[18px] mr-1">person</span>
                                            Suivre
                                        </button>
                                    ) : (
                                        <button
                                            onMouseEnter={() => setIsHover(true)}
                                            onMouseLeave={() => setIsHover(false)}
                                            onClick={() => {
                                                if (userId !== null) {
                                                    unfollowUser(userId, userData.id);
                                                    setIsFollowing(false);
                                                }
                                            }}
                                            className="mt-3 hover:bg-red-500 duration-100 ease-in flex items-center justify-center w-auto text-white bg-(--light-grey-bg) cursor-pointer relative top-5 right-5 font-medium rounded-full text-sm px-5 h-[40px] text-center"
                                        >
                                            <span className="material-icons-outlined !text-[18px] mr-1">person</span>
                                            {isHover ? "Se désabonner" : "Abonné"}
                                        </button>
                                    )}
                                </>
                            )}

                            {userData.id != userId && (
                                <Link href={`/messages`} className="mt-3 hover:opacity-70 duration-100 ease-in flex items-center justify-center w-auto text-white bg-(--blue) cursor-pointer relative top-5 right-5 font-medium rounded-full text-sm px-5 h-[40px] text-center">
                                    <span className="material-icons-outlined !text-[16px] mt-1 mr-1">chat</span>
                                    Envoyer un message
                                </Link>
                            )}
                        </div>

                    </div>

                    <div className="flex align-start justify-between px-10 mt-5 mb-5">
                        <div className="w-[100%] flex flex-col gap-2">
                            <div className="flex flex-col">
                                <span className="font-bold name">{userData.lastname} {userData.firstname}</span>
                                <Link href={`/profiles/${userData.username}`} className="w-fit text-(--text-grey)  text-sm hover:underline">@{userData.username}</Link>
                            </div>

                            <div className="flex gap-3">
                                <Link target="_blank" href={`https://linkedin.fr/in/${userData.linkedin}`}><FaLinkedinIn size={15} /></Link>
                                <Link target="_blank" href={`https://${userData.website}`}><FaInternetExplorer size={15} /></Link>
                                <Link target="_blank" href={`https://github.com/${userData.github}`}><FiGithub size={15} /></Link>
                            </div>

                            <div className="flex flex-col mt-5 max-w-[80%]">
                                <p className="text-(--text-primary)" id="bio">{userData.bio}</p>
                                <span className="text-(--text-grey) text-sm">
                                    Inscrit depuis le {userData.created_at && new Date(userData.created_at).toLocaleDateString('fr-FR', { weekday: 'long', day: '2-digit', month: 'long' })}
                                </span>
                            </div>

                            <div className="mt-3 flex justify-end flex-row w-full gap-5">
                                <Link href={`/profiles/${username}/following`} className="hover:border-(--blue) border-1 border-(--border-grey-light) rounded-sm p-2 text-sm"><span className="font-bold">{following.length}</span> abonnements</Link>
                                <Link href={`/profiles/${username}/followers`} className="hover:border-(--blue) border-1 border-(--border-grey-light) rounded-sm p-2 text-sm"><span className="font-bold">{followers.length}</span> abonnées</Link>
                            </div>
                        </div>
                    </div>
                </div>

                <Tabs />
            </div>

        </>
    );
}
