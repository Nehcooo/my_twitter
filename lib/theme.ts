export function getTheme() {
    return localStorage.getItem("theme") || "light";
}

export function saveTheme(newTheme: string) {
    localStorage.setItem("theme", newTheme);
}