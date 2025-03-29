import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/db";

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const hashtag = searchParams.get('hashtag');
        let query = "";
        let values: any[] = [];

        if (hashtag === 'hashtag') {
            query = `
                SELECT * FROM tweets AS tw 
                LEFT JOIN tweets_hastag AS tw_hg ON tw_hg.tweets_id = tw.id 
                JOIN hastag_list AS hg_li ON hg_li.id = tw_hg.hastag_list_id
                WHERE hg_li.name = ?
            `;
            values = [hashtag];
        } else if (hashtag === 'all') {
            query = `
                SELECT *, COUNT(tweets_hastag.id) as "count" FROM hastag_list
                INNER JOIN tweets_hastag ON hastag_list.id = tweets_hastag.hastag_list_id
                GROUP BY hastag_list.id
            `;

            values = [null];
        }

        const [hashtags] = await connection.query(query, values);
        return NextResponse.json({ success: true, hashtags }, { status: 201 });
    } catch (error) {
        console.log('Error lors de la récupération des données : ', error);
        return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 });
    }

}