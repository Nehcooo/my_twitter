import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/db";


export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let query;
        let values;

        const userId = searchParams.get('userId');

        if (userId) {
            query = `
                SELECT 
                    users.id, users.username, users.lastname, users.firstname, users.email, users.bio, users.icon, users.banner, users.github, users.linkedin, users.created_at, users.birthdate, users.website, COUNT(following.following_user_id) AS "following_count", COUNT(followed.followed_user_id) AS "followed_count"
                FROM users
                LEFT JOIN follows AS following ON users.id = following.following_user_id
                LEFT JOIN follows AS followed ON users.id = followed.followed_user_id
                WHERE users.id = ?
                GROUP BY users.id;
            `;

            values = [userId];
        } else {
            const page = searchParams.get('page');

            query = `
                SELECT 
                    users.id, users.username, users.lastname, users.firstname, users.email, users.bio, users.icon, users.banner, users.github, users.linkedin, users.created_at, users.birthdate, users.website, COUNT(following.following_user_id) AS "following_count", COUNT(followed.followed_user_id) AS "followed_count"
                FROM users
                LEFT JOIN follows AS following ON users.id = following.following_user_id
                LEFT JOIN follows AS followed ON users.id = followed.followed_user_id
                WHERE users.username = ?
                GROUP BY users.id;
            `;
            values = [page];
        }

        const [users] = await connection.query(query, values);
        return NextResponse.json(users);
    } catch (error) {
        console.error("Erreur GET /api/users :", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
