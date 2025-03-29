"use client";

import { useRouter, usePathname } from "next/navigation";
import ThemeButton from "./ThemeButton";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useUser } from "../ClientLayout";
import { Vibrant } from "node-vibrant/browser";
import Image from "next/image";
import { RxHamburgerMenu } from "react-icons/rx";
import { IoCloseOutline } from "react-icons/io5";

const nav = [
    { label: "Accueil", route: "/home", icon: "home" },
    { label: "Messagerie", route: "/messages", icon: "chat" },
];

export default function Header() {
    const router = useRouter();
    const currentRoute = usePathname();

    const [isOpen, setIsOpen] = useState<boolean>(true);
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

    const handleDisconnect = async () => {
        try {
            const response = await fetch("/api/auth/disconnect", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({}),
            });
            if (response.ok) {
                router.push("/auth/login");
            } else {
                console.log("Error : can't disconnect");
            }
        } catch {
            console.log("Error");
        }
    };

    const { userId } = useUser();
    const [userBanner, setUserBanner] = useState<string | null>(null);

    useEffect(() => {
        if (!userId) return;
        (async () => {
            try {
                const res = await fetch(`/api/users/userData?userId=${userId}`);
                const data = await res.json();
                if (Array.isArray(data) && data[0]?.banner) {
                    setUserBanner(data[0].banner);
                } else {
                    setUserBanner(null);
                }
            } catch (err) {
                console.error("Erreur récupération bannière:", err);
            }
        })();
    }, [userId]);

    const [bannerThemeActive, setBannerThemeActive] = useState(false);

    const applyBannerColors = (colors: [number, number, number][]) => {
        colors.forEach((rgb, index) => {
            document.documentElement.style.setProperty(
                `--banner-col-${index + 1}`,
                `rgb(${rgb.join(",")})`
            );
        });
    };

    const removeBannerColors = () => {
        for (let i = 1; i <= 5; i++) {
            document.documentElement.style.removeProperty(`--banner-col-${i}`);
        }
    };

    const toggleBannerTheme = () => {
        if (bannerThemeActive) {
            setBannerThemeActive(false);
            removeBannerColors();
        } else if (userBanner) {
            setBannerThemeActive(true);
        } else {
            console.log("Aucune bannière à analyser");
        }
    };

    useEffect(() => {
        if (bannerThemeActive && userBanner) {
            Vibrant.from(userBanner)
                .getPalette()
                .then((palette) => {
                    const colors = [
                        palette.Vibrant?.rgb,
                        palette.Muted?.rgb,
                        palette.DarkVibrant?.rgb,
                        palette.DarkMuted?.rgb,
                        palette.LightVibrant?.rgb,
                        palette.LightMuted?.rgb,
                    ].filter(Boolean) as number[][];

                    const sortedColors = colors.sort(
                        (a, b) =>
                            b.reduce((acc, val) => acc + val, 0) -
                            a.reduce((acc, val) => acc + val, 0)
                    );
                    const root = document.querySelector(":root") as HTMLElement;

                    root.style.setProperty(
                        "--primary",
                        `rgb(${sortedColors[0].join(",")})`
                    );
                    root.style.setProperty(
                        "--secondary",
                        `rgb(${sortedColors[1].join(",")})`
                    );
                    root.style.setProperty("--blue", `rgb(${sortedColors[2].join(",")})`);
                });
        } else {
            const root = document.querySelector(":root") as HTMLElement;

            root.style.removeProperty("--primary");
            root.style.removeProperty("--secondary");
            root.style.removeProperty("--blue");
            removeBannerColors();
        }
    }, [bannerThemeActive]);

    return (
        <>
            <header className="w-full h-[100px] fixed top-0 left-0 z-20 m-auto px-10 md:px-20 backdrop-blur-sm flex items-center">
                <nav className="w-full h-full flex flex-row justify-between items-center">
                    <Link className="cursor-pointer" href={"/"}>
                        <Image src={"/img/icon.png"} width={30} height={30} alt="logo" />
                    </Link>

                    {isMobile ? (
                        <div className="flex items-center justify-center gap-3">
                            <button
                                onClick={handleDisconnect}
                                className="hover:opacity-70 duration-100 ease-in flex items-center justify-center text-black cursor-pointer font-medium rounded-full text-sm h-[40px] text-center"
                            >
                                <span className="material-icons-round !text-[26px] mr-1 text-[var(--blue)] fill-icon">
                                    logout
                                </span>
                            </button>
                            <ThemeButton />
                            {isOpen ? (
                                <button onClick={() => setIsOpen(false)}>
                                    <RxHamburgerMenu size={35} />
                                </button>
                            ) : (
                                <button onClick={() => setIsOpen(true)}>
                                    <IoCloseOutline size={35} />
                                </button>
                            )}
                        </div>
                    ) : (
                        null
                    )}

                    {isMobile ? (
                        <ul className={`w-full h-fit ${isOpen ? 'scale-y-0' : 'scale-y-100'} p-5 fixed top-[100px] left-0 flex flex-col items-start justify-center gap-8 backdrop-blur-sm pb-10 shadow-sm`}>
                            {nav.map((element, index) =>
                                currentRoute === element.route ? (
                                    <li key={index}>
                                        <Link
                                            href={element.route}
                                            className="hover:opacity-70 duration-100 ease-in flex items-center justify-center text-black bg-[var(--white)] cursor-pointer font-medium rounded-full text-sm px-4 h-[40px] text-center"
                                        >
                                            <span className="material-icons-round !text-[22px] mr-1 text-[var(--blue)] fill-icon">
                                                {element.icon}
                                            </span>
                                            {element.label}
                                        </Link>
                                    </li>
                                ) : (
                                    <li key={index}>
                                        <Link
                                            key={index}
                                            href={element.route}
                                            className="hover:opacity-70 duration-100 ease-in flex items-center justify-center text-black bg-none cursor-pointer font-medium rounded-full text-sm h-[40px] text-center"
                                        >
                                            <span className="material-icons-round !text-[24px] mr-1 text-[var(--blue)] fill-icon">
                                                {element.icon}
                                            </span>
                                        </Link>
                                    </li>
                                )
                            )}
                            <li>
                                <div className={`relative z-[2] rounded-full transition-all ml-2 ${bannerThemeActive ? "scale-95" : ""}`} >
                                    <button
                                        onClick={toggleBannerTheme}
                                        className={`appearance-none outline-none cursor-pointer select-none relative z-[3] rounded-full bg-gradient-to-r from-white/5 via-white/20 to-white/5 text-black dark:text-white backdrop-blur-[2px] transition-transform duration-300 active:scale-95 hover:scale-[0.975] px-6 py-3`}
                                    >
                                        <span className="relative block font-medium text-sm [text-shadow:0_2px_1px_rgba(0,0,0,0.1)] transition-all">
                                            {bannerThemeActive ? "Banner Theme ON" : "Generate"}
                                        </span>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    ) : (
                        <ul className="flex items-center justify-center gap-8">
                            {nav.map((element, index) =>
                                currentRoute === element.route ? (
                                    <li key={index}>
                                        <Link
                                            href={element.route}
                                            className="hover:opacity-70 duration-100 ease-in flex items-center justify-center text-black bg-[var(--white)] cursor-pointer font-medium rounded-full text-sm px-4 h-[40px] text-center"
                                        >
                                            <span className="material-icons-round !text-[22px] mr-1 text-[var(--blue)] fill-icon">
                                                {element.icon}
                                            </span>
                                            {element.label}
                                        </Link>
                                    </li>
                                ) : (
                                    <li key={index}>
                                        <Link
                                            key={index}
                                            href={element.route}
                                            className="hover:opacity-70 duration-100 ease-in flex items-center justify-center text-black bg-none cursor-pointer font-medium rounded-full text-sm h-[40px] text-center"
                                        >
                                            <span className="material-icons-round !text-[24px] mr-1 text-[var(--blue)] fill-icon">
                                                {element.icon}
                                            </span>
                                        </Link>
                                    </li>
                                )
                            )}
                            <li>
                                <button
                                    onClick={handleDisconnect}
                                    className="hover:opacity-70 duration-100 ease-in flex items-center justify-center text-black cursor-pointer font-medium rounded-full text-sm h-[40px] text-center"
                                >
                                    <span className="material-icons-round !text-[26px] mr-1 text-[var(--blue)] fill-icon">
                                        logout
                                    </span>
                                </button>
                            </li>
                            <li>
                                <ThemeButton />
                            </li>
                            <li>
                                <div className={`relative z-[2] rounded-full transition-all ml-2 ${bannerThemeActive ? "scale-95" : ""}`} >
                                    <button
                                        onClick={toggleBannerTheme}
                                        className={`appearance-none outline-none cursor-pointer select-none relative z-[3] rounded-full bg-gradient-to-r from-white/5 via-white/20 to-white/5 text-black dark:text-white backdrop-blur-[2px] transition-transform duration-300 active:scale-95 hover:scale-[0.975] px-6 py-3`}
                                    >
                                        <span className="relative block font-medium text-sm [text-shadow:0_2px_1px_rgba(0,0,0,0.1)] transition-all">
                                            {bannerThemeActive ? "Banner Theme ON" : "Generate"}
                                        </span>
                                    </button>
                                </div>
                            </li>
                        </ul>
                    )}
                </nav>
            </header>
        </>
    );
}
