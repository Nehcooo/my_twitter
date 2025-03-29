import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connection from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = searchParams.get("page");
        const userId = searchParams.get("userId");

        const followingUserId = searchParams.get('following_user_id');
        const followedUserId = searchParams.get('followed_user_id');

        if (!userId && !followedUserId && !followedUserId) {
            return NextResponse.json({ error: "Paramètre manquant" }, { status: 400 });
        }

        if (page === "followers") {
            const query = `
                SELECT users.id, users.username, users.icon 
                FROM follows 
                JOIN users ON follows.following_user_id = users.id
                WHERE follows.followed_user_id = ?
            `;
            const values = [Number(userId)];

            const [result] = await connection.query(query, values);
            return NextResponse.json({ followers: result });
        } else if (page === 'following') {
            const query = `
                SELECT users.id, users.username, users.icon
                FROM follows 
                JOIN users ON follows.followed_user_id = users.id
                WHERE follows.following_user_id = ?;
            `;
            const values = [Number(userId)];

            const [result] = await connection.query(query, values);
            return NextResponse.json({ following: result });
        } else if (page === 'follow') {
            const query = `
                SELECT * FROM follows
                WHERE following_user_id = ? AND followed_user_id = ?
            `;
            const values = [Number(followingUserId), Number(followedUserId)];

            const [result] = await connection.query(query, values);

            const isFollowing = Array.isArray(result) && result.length > 0;
            return NextResponse.json({ isFollowing });
        }


        return NextResponse.json({ error: "Page invalide" }, { status: 400 });
    } catch (error) {
        console.error("Erreur lors de la récupération des followers :", error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        const { following_user_id, followed_user_id } = body;

        if (!following_user_id || !followed_user_id) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        const query = `
            INSERT INTO follows (following_user_id, followed_user_id, created_at) 
            VALUES (?, ?, NOW())
        `;

        const values = [Number(following_user_id), Number(followed_user_id)];

        const [result] = await connection.query(query, values);

        return NextResponse.json({ message: 'Utilisateur suivi avec succès', result });
    } catch (error) {
        console.error('Erreur lors de l\'insertion des données :', error);
        return NextResponse.json({ error: 'Erreur lors de l\'insertion des données' }, { status: 500 });
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const body = await request.json();

        const { following_user_id, followed_user_id } = body;

        if (!following_user_id || !followed_user_id) {
            return NextResponse.json({ error: 'Paramètres manquants' }, { status: 400 });
        }

        const query = `
            DELETE FROM follows 
            WHERE following_user_id = ? AND followed_user_id = ?
        `;

        const values = [Number(following_user_id), Number(followed_user_id)];

        const [result] = await connection.query(query, values);

        return NextResponse.json({ message: 'Utilisateur désuivi avec succès', result });
    } catch (error) {
        console.error('Erreur lors de la suppression des données :', error);
        return NextResponse.json({ error: 'Erreur lors de la suppression des données' }, { status: 500 });
    }
}
