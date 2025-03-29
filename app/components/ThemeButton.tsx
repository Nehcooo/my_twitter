"use client";

import { useTheme } from "../ClientLayout";

export default function ThemeButton() {
    const { theme, updateTheme } = useTheme();

    return (
        <div className="select-none pl-5 flex items-center justify-center cursor-pointer" onClick={() => updateTheme(theme === "dark" ? "light" : "dark")}>
            {theme === "dark" ? (
                <span className="material-icons-outlined">light_mode</span>
            ) : (
                <span className="material-icons-outlined">dark_mode</span>
            )}
        </div>

    )
}