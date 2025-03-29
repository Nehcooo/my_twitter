import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/db";


export async function GET(request: NextRequest) {
    try {
        const [users] = await connection.query(`
            SELECT 
                users.id, users.username, users.lastname, users.firstname, users.icon, COUNT(followed.followed_user_id) AS "followed_count"
            FROM users
            LEFT JOIN follows AS followed ON users.id = followed.followed_user_id
            GROUP BY users.id
            ORDER BY COUNT(followed.followed_user_id) DESC
            LIMIT 3;
        `, []);

        return NextResponse.json(users);
    } catch (error) {
        console.error("Erreur GET /api/users :", error);
        return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
    }
}
