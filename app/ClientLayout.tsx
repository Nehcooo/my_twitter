"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { getTheme, saveTheme } from "../lib/theme";
import "material-icons/iconfont/material-icons.css";
import { ToastContainer } from 'react-toastify';
const ThemeContext = createContext({ theme: "", updateTheme: (newTheme: string) => { } });

export function useTheme() {
    return useContext(ThemeContext);
}

const UserContext = createContext({ userId: null as number | null, refreshUserId: () => { } });

export function useUser() {
    return useContext(UserContext);
}

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [userId, setUserId] = useState<number | null>(null);
    const [theme, setTheme] = useState("light");

    const updateTheme = (newTheme: string) => {
        saveTheme(newTheme);
        setTheme(newTheme);
    }

    const refreshUserId = () => {
        fetch("/api/users/userId", { method: "GET" })
            .then((res) => res.json())
            .then((data) => setUserId(data.id))
            .catch(() => setUserId(null));
    }

    useEffect(() => {
        setTheme(getTheme());
        refreshUserId();
    }, []);

    return (
        <UserContext.Provider value={{ userId, refreshUserId }}>
            <ThemeContext.Provider value={{ theme, updateTheme }}>
                <body className={`${theme} antialiased`}>{children}<ToastContainer /></body>
            </ThemeContext.Provider>
        </UserContext.Provider>
    );
}
