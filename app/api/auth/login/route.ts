import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import connection from "@/lib/db";
import { SignJWT } from "jose";
import { serialize } from "cookie";

const SECRET_KEY = new TextEncoder().encode(process.env.JWT_SECRET || "");

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        const [rows]: any = await connection.execute('SELECT * FROM users WHERE email = ? AND is_deleted = false', [email]);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
        }

        const user = rows[0];

        const isValidPassword = await bcrypt.compare(password, user.password);
        if (!isValidPassword) {
            return NextResponse.json({ error: "Mot de passe incorrect" }, { status: 401 });
        }

        if (!process.env.JWT_SECRET) {
            console.error("JWT_SECRET n'est pas défini dans le fichier .env");
            return NextResponse.json({ error: "Erreur de configuration interne" }, { status: 500 });
        }

        const token = await new SignJWT({ id: user.id, email: user.email })
            .setProtectedHeader({ alg: "HS256" })
            .setExpirationTime("24h")
            .sign(SECRET_KEY);

        const tokenCookie = serialize("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "strict",
            path: "/",
            maxAge: 60 * 60 * 24,
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
