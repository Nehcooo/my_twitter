import { NextResponse } from "next/server";
import { serialize } from "cookie";

export async function POST(req: Request) {
    try {
        const tokenCookie = serialize("token", "", {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 0, // 1 heure
        });

        return new NextResponse(
            JSON.stringify({
                message: "Connexion réussie",
            }),
            {
                status: 200,
                headers: {
                    "Set-Cookie": tokenCookie,
                    "Content-Type": "application/json",
                },
            }
        );
    } catch (error) {
        console.error("Erreur de connexion :", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
