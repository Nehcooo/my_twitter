import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/db";
import { GetUserId } from "@/lib/user";

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { tweet, medias, parentId, type, filteredHashtags } = body;

        console.log("body", body);
        let hashtags = filteredHashtags;

        const authUserId = await GetUserId();
        if (!authUserId) {
            return NextResponse.json({ error: "Utilisateur non authentifié" }, { status: 401 });
        }

        const tweetQuery = `INSERT INTO tweets (user_id, parent_id, type, tweet, medias) VALUES (?, ?, ?, ?, ?)`;
        const [tweetResult]: any = await connection.query(tweetQuery, [
            authUserId,
            parentId || null,
            type || "original",
            tweet,
            JSON.stringify(medias) || "[]",
        ]);

        const tweetId = tweetResult.insertId;
        if (hashtags && hashtags.length > 0) {
            const hashtagIds: number[] = [];

            for (const hashtag of hashtags) {
                let hashtagId;                

                const [existingHashtags]: any = await connection.query(
                    `SELECT id FROM hastag_list WHERE name = ? LIMIT 1`,
                    [hashtag]
                );

                if (existingHashtags.length > 0) {
                    hashtagId = existingHashtags[0].id;
                } else {
                    const [insertHashtag]: any = await connection.query(
                        `INSERT INTO hastag_list (name) VALUES (?)`,
                        [hashtag]
                    );
                    hashtagId = insertHashtag.insertId;
                }

                console.log(`Hashtag ${hashtag} → ID: ${hashtagId}`);

                hashtagIds.push(hashtagId);

                await connection.query(
                    `INSERT INTO tweets_hastag (tweets_id, hastag_list_id) VALUES (?, ?)`,
                    [tweetId, hashtagId]
                );
            }

            return NextResponse.json({ success: true, tweetId, hashtagIds }, { status: 201 });
        } else {
            return NextResponse.json({ success: true, tweetId, hashtagIds: [] }, { status: 201 });
        }

    } catch (error) {
        console.error("Erreur serveur :", error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }
}

