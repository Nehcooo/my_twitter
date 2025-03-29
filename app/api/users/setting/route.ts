import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import connection from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const { userId, oldPassword, newPassword } = await req.json();

        if (!userId || !oldPassword || !newPassword) {
            return NextResponse.json({ message: "Données manquantes" }, { status: 400 });
        }

        const [rows]: any = await connection.query("SELECT password FROM users WHERE id = ?", [userId]);

        if (!rows || rows.length === 0) {
            return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 });
        }

        const user = rows[0];
        const validPassword = await bcrypt.compare(oldPassword, user.password);

        if (!validPassword) {
            return NextResponse.json({ message: "Ancien mot de passe incorrect" }, { status: 401 });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await connection.query("UPDATE users SET password = ? WHERE id = ?", [hashedPassword, userId]);

        return NextResponse.json({ message: "Mot de passe mis à jour avec succès" }, { status: 200 });

    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ message: "Erreur serveur" }, { status: 500 });
    }
}
