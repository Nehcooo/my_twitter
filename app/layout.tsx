import type { Metadata } from "next";
import ClientLayout from "./ClientLayout";
import "./globals.css";
import Header from "./components/Header";
import Profile from "./components/Profile";
import Trends from "./components/Trends";
import PathnameProvider from "@/app/pathnameProvider";

export const metadata: Metadata = {
    title: "Twitter",
    description: "Twitter description",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {

    return (
        <html lang="en">
            <ClientLayout>
                <Header />
                <PathnameProvider>
                    {children}
                </PathnameProvider>
            </ClientLayout>
        </html>
    );
}
