"use client";

import Profile from "@/app/components/Profile";
import Trends from "@/app/components/Trends";
import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { usePathname } from "next/navigation";

export default function ConditionalLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const [activeComponent, setActiveComponent] = useState<"content" | "profile" | "trends">("content");
    const [isMobile, setIsMobile] = useState<boolean>(false);

    useEffect(() => {
        const checkScreenSize = () => {
            setIsMobile(window.innerWidth <= 987);
        };

        checkScreenSize();
        window.addEventListener("resize", checkScreenSize);

        return () => {
            window.removeEventListener("resize", checkScreenSize);
        };
    }, []);

    useEffect(() => {
        setActiveComponent("content");
    }, [pathname]);

    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (activeComponent === "content") setActiveComponent("trends");
            else if (activeComponent === "profile") setActiveComponent("content");
        },
        onSwipedRight: () => {
            if (activeComponent === "content") setActiveComponent("profile");
            else if (activeComponent === "trends") setActiveComponent("content");
        },
        preventScrollOnSwipe: true,
        trackMouse: true,
    });

    return (
        <div {...(isMobile ? handlers : {})} className="flex justify-between min-h-screen relative pt-25">
            {!isMobile ? (
                <>
                    <div className="w-[23.5%] h-[85vh] sticky top-25 overflow-auto">
                        {(pathname !== "/messages" && pathname !== "/auth/login" && pathname !== "/auth/signup") && <Profile />}
                    </div>
                    {children}
                    <div className="w-[23.5%] h-[80vh] sticky top-25">
                        {(pathname !== "/messages" && pathname !== "/auth/login" && pathname !== "/auth/signup") && <Trends />}
                    </div>
                </>
            ) : (
                <>
                    <div className={`w-full fixed transition-transform duration-300 overflow-y-auto ${activeComponent === "profile" ? "translate-x-0" : "-translate-x-full"}`}>
                        {(pathname !== "/auth/login" && pathname !== "/auth/signup") && <Profile />}
                    </div>

                    <div className={`w-full transition-transform duration-300 ${activeComponent === "content" ? "translate-x-0" : (activeComponent === "profile" ? "translate-x-full" : "-translate-x-full")}`}>
                        {children}
                    </div>

                    <div className={`w-full fixed transition-transform duration-300 ${activeComponent === "trends" ? "translate-x-0" : "translate-x-full"}`}>
                        {(pathname !== "/auth/login" && pathname !== "/auth/signup") && <Trends />}
                    </div>
                </>
            )}
        </div>
    );
}
