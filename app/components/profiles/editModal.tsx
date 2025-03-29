'use client';
import Image from "next/image";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { UserProfile } from "@/app/types/user";
import { useUser } from "@/app/ClientLayout";
import { toast } from "react-toastify";
import { useRouter } from "next/navigation";
import { IoIosClose } from "react-icons/io";
import { TbCameraPlus } from "react-icons/tb";
import { useRef } from "react";
import { uploadMedia } from "@/lib/api-image";

interface EditModalProps {
    onClose: () => void;
}

export default function EditModal({ onClose }: EditModalProps) {
    const params = useParams<{ username: string }>();
    const username = params?.username;
    const { userId } = useUser();
    const route = useRouter();


    const fileInputRefBanner = useRef<HTMLInputElement>(null);
    const fileInputRefIcon = useRef<HTMLInputElement>(null);
    const icon = document.querySelector('#icon');
    const banner = document.querySelector('#banner');
    const [previewBanner, setPreviewBanner] = useState<string | null>(null);
    const [previewIcon, setPreviewIcon] = useState<string | null>(null);
    const [, setSelectedFile] = useState(null);
    const [userData, setUserData] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [formData, setFormData] = useState({
        iconDefault: userData?.icon,
        bannerDefault: userData?.banner,
        username: "",
        bio: "",
        linkedin: "",
        github: "",
        website: "",
        birthdate: ""
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
                    iconDefault: user?.icon || "",
                    bannerDefault: user?.banner || "",
                    username: user?.username || "",
                    bio: user?.bio || "",
                    linkedin: user?.linkedin || "",
                    github: user?.github || "",
                    website: user?.website || "",
                    birthdate: user?.birthdate ? new Date(user.birthdate).toISOString().split("T")[0] : ""
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

        try {
            const response = await fetch(`/api/users/edit?page=${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                toast.success("Modification réussie !");
                await onClose();

                route.push(`/profiles/${formData.username}`);
            } else {
                toast.error('Une erreur est survenue');
                setIsLoading(false);
            }
        } catch (error) {
            console.error("Erreur lors de la récupération des données utilisateur :", error);
        } finally {
            setIsLoading(false);
        }
    };
    let urlBanner = userData?.banner;
    let urlIcon = userData?.icon;

    const handleClickBanner = async () => {
        if (fileInputRefBanner.current) {
            fileInputRefBanner.current.click();
        }
        banner?.addEventListener('change', async (e: any) => {
            const file = e.target.files[0];

            if (file) {
                urlBanner = await uploadMedia(file);
                setSelectedFile(file);
                setFormData(prev => ({ ...prev, urlBanner }));
            }
        });
    };

    const handleClickIcon = () => {
        if (fileInputRefIcon.current) {
            fileInputRefIcon.current.click();
        }
        icon?.addEventListener('change', async (e: any) => {
            const file = e.target.files[0];

            if (file) {
                urlIcon = await uploadMedia(file);
                setSelectedFile(file);
                setFormData(prev => ({ ...prev, urlIcon }));
            }
        });
    }

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "banner" | "icon") => {
        if (e.target.files?.[0]) {
            const file = e.target.files[0];
            const reader = new FileReader();

            reader.onloadend = () => {
                if (type === "banner") setPreviewBanner(reader.result as string);
                else setPreviewIcon(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <>
            <div className="w-full max-w-[550px] max-h-[550px] z-20 overflow-y-scroll fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-(--secondary) rounded-xl">
                <div className="sticky top-0 px-5 py-3 bg-(--primary) flex justify-between items-center">
                    <div className="flex flex-row items-center gap-5">
                        <button className="cursor-pointer rounded-full hover:border border-white" onClick={onClose}><IoIosClose size={35} /></button>
                        <span>Edit profiles</span>
                    </div>
                    <button className="px-3 py-1 cursor-pointer rounded-xl bg-white text-black hover:opacity-70 active:scale-95" onClick={handleSubmit}>Save</button>
                </div>

                <div className="flex flex-col items-center pb-18">
                    <div>
                        <div className="max-h-[220px] relative cursor-pointer overflow-hidden">
                            <form className="overflow-hidden">
                                <Image
                                    width={626} height={237}
                                    src={previewBanner || (userData?.banner ? userData.banner : "/img/default-banner.avif")}
                                    alt="banner"
                                />

                                <div className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800/75 flex items-center justify-center">
                                    <button
                                        type="button"
                                        onClick={handleClickBanner}
                                        role="button"
                                        className="hover:bg-gray-800/50 cursor-pointer py-4 px-4 rounded-full"
                                    ><TbCameraPlus size={35} /></button>
                                    <input
                                        type="file"
                                        ref={fileInputRefBanner}
                                        id="banner" name="banner"
                                        className="w-[1px] h-[1px]"
                                        onChange={(e) => handleFileChange(e, "banner")}
                                    />
                                </div>
                            </form>
                        </div>
                        <div className="w-[80px] ml-10 rounded-full -mt-[40px] relative cursor-pointer">
                            <form action="">
                                <Image
                                    className="rounded-full"
                                    width={200} height={200}
                                    src={previewIcon || (userData?.icon ? `${userData.icon}` : "/img/default_user_icon.png")}
                                    alt="avatar"
                                />
                                <div className="w-full h-full absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800/75 flex items-center justify-center rounded-full">
                                    <button
                                        type="button"
                                        role="button"
                                        onClick={handleClickIcon}
                                        className="hover:bg-gray-800/50 cursor-pointer py-2 px-2 rounded-full"
                                    ><TbCameraPlus size={20} /></button>
                                    <input
                                        type="file"
                                        ref={fileInputRefIcon}
                                        name="icon" id="icon"
                                        className="w-[1px] h-[1px]"
                                        onChange={(e) => handleFileChange(e, "icon")}
                                    />
                                </div>
                            </form>
                        </div>
                    </div>

                    <form className="w-[60%]" onSubmit={handleSubmit}>
                        <div className="flex gap-10 mt-10 flex-col w-full">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="username">Username :</label>
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    onChange={handleChange}
                                    value={formData.username}
                                    name="username"
                                    id="username"
                                    type="text"
                                    placeholder="Nom"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="bio">Bio :</label>
                                <textarea
                                    className="border border-grey-500 py-2 px-3 rounded-md min-h-[150px]"
                                    name="bio"
                                    id="bio"
                                    onChange={handleChange}
                                    value={formData.bio}
                                    placeholder="Bio..."
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="linkedin">Linkedin :</label>
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    name="linkedin"
                                    id="linkedin"
                                    onChange={handleChange}
                                    value={formData.linkedin}
                                    type="text"
                                    placeholder="LinkedIn"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="github">Github :</label>
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    name="github"
                                    id="github"
                                    onChange={handleChange}
                                    value={formData.github}
                                    type="text"
                                    placeholder="Github"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label htmlFor="website">Site Web :</label>
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    name="website"
                                    id="website"
                                    onChange={handleChange}
                                    value={formData.website}
                                    type="text"
                                    placeholder="ex : www.m-aydin.fr"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <span>Date de naissance :</span>
                                <input
                                    className="border border-grey-500 py-2 px-3 rounded-md"
                                    name="birthdate"
                                    onChange={handleChange}
                                    value={formData.birthdate}
                                    type="date"
                                />
                            </div>
                        </div>
                    </form>
                </div>
            </div>
            <div onClick={onClose} className="w-full h-screen z-10 fixed top-0 left-0 bg-black/75"></div>
        </>
    );
}
