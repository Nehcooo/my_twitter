import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connection from '@/lib/db';

import { GetUserId } from "@/lib/user";

export async function DELETE(request: NextRequest) {
    try {
        const { tweetId } = await request.json();
        const userId = await GetUserId();
        
        const [tweets] = await connection.query("UPDATE tweets SET is_deleted = ? WHERE user_id = ? AND parent_id = ?", [true, userId, tweetId]);

        return NextResponse.json(tweets);
    } catch (error) {
        console.log("Error", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}