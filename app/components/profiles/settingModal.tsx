'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserProfile } from "@/app/types/user";
import { useUser } from "@/app/ClientLayout";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { IoIosClose } from "react-icons/io";
import { useRef } from "react";

interface SettingModalProps {
    onClose: () => void;
}

export default function Setting({ onClose }: SettingModalProps) {
    const params = useParams<{ username: string }>();
    const username = params?.username;
    const { userId } = useUser();
    const route = useRouter();


    const [previewBanner,] = useState<string | null>(null);
    const [previewIcon,] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        email: "",
        oldPassword: "",
        newPassword: "",
        confirmNewPassword: "",
    });


    useEffect(() => {
        document.body.style.overflow = "hidden";

        return () => {
            document.body.style.overflow = "auto";
        };
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

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
                const user = data[0];
                setUserData(user);

                setFormData({
                    email: user.email || "",
                    oldPassword: "",
                    newPassword: "",
                    confirmNewPassword: ""
                });
            } catch (error) {
                console.error("Erreur lors de la récupération des données utilisateur :", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUserData();
    }, [username]);


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.oldPassword || !formData.newPassword || !formData.confirmNewPassword) {
            toast.error("Tous les champs doivent être remplis");
            return;
        }

        if (formData.newPassword.length < 8) {
            toast.error("Le mot de passe doit contenir au moins 8 caractères");
            return;
        }

        if (formData.newPassword !== formData.confirmNewPassword) {
            toast.error("Les nouveaux mots de passe ne correspondent pas");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`/api/users/setting`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                    oldPassword: formData.oldPassword,
                    newPassword: formData.newPassword,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Mot de passe mis à jour avec succès !");
                onClose();
                route.push(`/profiles/${username}`);
            } else {
                toast.error(data.message || "Une erreur est survenue");
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du mot de passe :", error);
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(`/api/users/delete`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    userId,
                }),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Compte supprimer avec succès !");
                onClose();
                handleDisconnect();
                route.push(`/auth/login`);
            } else {
                toast.error(data.message || "Une erreur est survenue");
            }
        } catch (error) {
            console.error("Erreur lors de la mise à jour du mot de passe :", error);
            toast.error("Une erreur est survenue");
        } finally {
            setIsLoading(false);
        }
    }

    const handleDisconnect = async () => {
        try {
            const response = await fetch("/api/auth/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            if (response.ok) {
                route.push("/auth/login");
            } else {
                console.log("Error : can't disconnect");
            }
        } catch {
            console.log("Error");
        }
    };


    return (
        <>
            <div className="w-full max-w-[550px] max-h-[550px] z-20 overflow-y-scroll fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--secondary) rounded-xl">
                <div className="sticky top-0 px-5 py-3 bg-(--primary) flex justify-between items-center">
                    <div className="flex flex-row items-center gap-5">
                        <button className="cursor-pointer rounded-full hover:border border-white" onClick={onClose}><IoIosClose size={35} /></button>
                        <span>Setting profiles</span>
                    </div>
                    <button className="px-3 py-1 cursor-pointer rounded-xl bg-white text-black hover:opacity-70 active:scale-95" onClick={handleSubmit}>Save</button>
                </div>

                <div className="flex flex-col items-center pb-18">
                    <div>
                        <div className="max-h-[220px] relative cursor-pointer">
                            <Image
                                width={626} height={237}
                                src={previewBanner || (userData?.banner ? userData.banner : "/img/default-banner.avif")}
                                alt="banner"
                            />
                        </div>
                        <div className="w-[80px] ml-10 rounded-full -mt-[40px] relative cursor-pointer">
                            <Image
                                className="rounded-full"
                                width={200} height={200}
                                src={previewIcon || (userData?.icon ? `${userData.icon}` : "/img/default_user_icon.png")}
                                alt="avatar"
                            />

                        </div>
                    </div>

                    <form className="w-[60%]" onSubmit={handleSubmit}>
                        <div className="flex gap-10 mt-10 flex-col w-full">
                            <div className="flex flex-col gap-3">
                                <label>Email :</label>
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    onChange={handleChange}
                                    value={formData.email}
                                    name="username"
                                    type="text"
                                    placeholder="email"
                                />
                            </div>

                            <div className="flex flex-col gap-5 rounded-md">
                                <span>Changer son mots de passe :</span>
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    name="oldPassword"
                                    onChange={handleChange}
                                    value={formData.oldPassword}
                                    type="password"
                                    placeholder="Ancien mot de passe"
                                />
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    name="newPassword"
                                    onChange={handleChange}
                                    value={formData.newPassword}
                                    type="password"
                                    placeholder="Nouveau mot de passe"
                                />
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    name="confirmNewPassword"
                                    onChange={handleChange}
                                    value={formData.confirmNewPassword}
                                    type="password"
                                    placeholder="Confirmer le nouveau mot de passe"
                                />
                            </div>
                            <button onClick={handleDelete} type="button" className="py-2 px-5 rounded-md hover:opacity-70 bg-red-500 active:scale-[0.98] cursor-pointer">Supprimer le compte</button>
                        </div>
                    </form>
                </div>
            </div>
            <div onClick={onClose} className="w-full h-screen z-10 fixed top-0 left-0 bg-black/75"></div>
        </>
    );
}
