import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/db";


export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { username, bio, linkedin, github, website, birthdate, urlBanner, urlIcon, bannerDefault, iconDefault } = body;
        let query;
        let values;

        const searchParams = new URL(request.url).searchParams;
        const userId = searchParams.get("page");

        const bannerUrl = urlBanner && urlBanner.url ? urlBanner.url : bannerDefault;
        const iconUrl = urlIcon && urlIcon.url ? urlIcon.url : iconDefault;

        query = `UPDATE users SET username = ?, bio = ?, linkedin = ?, github = ?, website = ?, birthdate = ?, banner = ?, icon = ? WHERE id = ?`;
        values = [username, bio, linkedin, github, website, birthdate, bannerUrl, iconUrl, userId];


        const [usersUpdate] = await connection.query(query, values);
        return NextResponse.json(usersUpdate);
    } catch (error) {
        console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}
