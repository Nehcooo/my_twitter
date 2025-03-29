import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connection from '@/lib/db';

import { GetUserId } from "@/lib/user";

export async function POST(request: NextRequest) {

    try {
        const { tweetId, isLiked } = await request.json();
        const authUserId = await GetUserId();        

        let query = `INSERT INTO tweets_like (tweets_id, user_id) VALUES (?, ?)`;

        if (isLiked) {
            query = `DELETE FROM tweets_like WHERE tweets_id = ? AND user_id = ?`;
        }

        const [tweets] = await connection.query(query, [tweetId, authUserId]);
        return NextResponse.json(tweets);
    } catch (error) {
        console.log("Error", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}
