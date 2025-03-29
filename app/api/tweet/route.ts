import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import connection from '@/lib/db';

import { GetUserId } from "@/lib/user";

export async function GET(request: NextRequest) {

    try {
        const { searchParams } = new URL(request.url);

        const page = searchParams.get("page");
        const username = searchParams.get("username");
        const hashtag = searchParams.get("hashtag");
        const tweetId = searchParams.get("tweetId");
        const authUserId = await GetUserId();

        console.log('hashtag back : ', hashtag);

        const hashtagTweetsList: any[] = [];
        const [data]: any = await connection.query(`
            SELECT * FROM tweets_hastag
            LEFT JOIN hastag_list ON hastag_list.name = '${hashtag}' 
            WHERE tweets_hastag.hastag_list_id = hastag_list.id
        `, []);
    
        data.forEach((element: any) => {
            hashtagTweetsList.push(element.tweets_id)
        });
        
        let query = `
            SELECT
                #Main

                tweets.id AS tweet_id, 
                tweets.type, 
                tweets.tweet, 
                tweets.medias, 
                tweets.is_deleted, 
                tweets.created_at AS tweet_created_at,
                ISNULL(liked.id) = 0 AS liked, 
                COUNT(DISTINCT likes_count.id) AS likes_count,
                ISNULL(retweeted.id) = 0 AS retweeted, 
                COUNT(DISTINCT retweet_count.id) AS retweet_count,
                COUNT(DISTINCT reply_count.id) AS reply_count,
                JSON_OBJECT(
                    'id', tweet_user.id,
                    'username', tweet_user.username,
                    'lastname', tweet_user.lastname,
                    'firstname', tweet_user.firstname,
                    'icon', tweet_user.icon
                ) AS user,

                #Parent

                CASE
                    WHEN parent_tweet.id IS NOT NULL THEN JSON_OBJECT(
                        'tweet_id', parent_tweet.id,
                        'type', parent_tweet.type,
                        'tweet', parent_tweet.tweet,
                        'medias', parent_tweet.medias,
                        'tweet_created_at', parent_tweet.created_at,
                        'liked', ISNULL(parent_liked.id) = 0, 
                        'likes_count', COUNT(DISTINCT parent_likes_count.id),
                        'retweeted', ISNULL(parent_retweeted.id) = 0, 
                        'retweet_count', COUNT(DISTINCT parent_retweet_count.id),
                        'reply_count', COUNT(DISTINCT parent_reply_count.id),
                        'user', JSON_OBJECT(
                            'user_id', parent_user.id,
                            'username', parent_user.username,
                            'lastname', parent_user.lastname,
                            'firstname', parent_user.firstname,
                            'icon', parent_user.icon
                        ),

                        #Grandparent

                        'parent',
                        CASE 
                            WHEN grandparent_tweet.id IS NOT NULL THEN JSON_OBJECT(
                                'tweet_id', grandparent_tweet.id,
                                'type', grandparent_tweet.type,
                                'tweet', grandparent_tweet.tweet,
                                'medias', grandparent_tweet.medias,
                                'tweet_created_at', grandparent_tweet.created_at,
                                'liked', ISNULL(grandparent_liked.id) = 0, 
                                'likes_count', COUNT(DISTINCT grandparent_likes_count.id),
                                'retweeted', ISNULL(grandparent_retweeted.id) = 0, 
                                'retweet_count', COUNT(DISTINCT grandparent_retweet_count.id),
                                'reply_count', COUNT(DISTINCT grandparent_reply_count.id),
                                'user', JSON_OBJECT(
                                    'user_id', grandparent_user.id,
                                    'username', grandparent_user.username,
                                    'lastname', grandparent_user.lastname,
                                    'firstname', grandparent_user.firstname,
                                    'icon', grandparent_user.icon
                                )
                            ) ELSE NULL
                        END
                    )
                ELSE NULL 
                END AS parent
            FROM tweets 

            #Main

            LEFT JOIN users AS tweet_user ON tweet_user.id = tweets.user_id 
            LEFT JOIN tweets_like AS liked ON liked.user_id = ${authUserId} AND liked.tweets_id = tweets.id
            LEFT JOIN tweets_like AS likes_count ON likes_count.tweets_id = tweets.id
            LEFT JOIN tweets AS retweeted ON retweeted.is_deleted = 0 AND retweeted.user_id = ${authUserId} AND retweeted.parent_id = tweets.id AND retweeted.type = 'retweet'
            LEFT JOIN tweets AS retweet_count ON retweet_count.is_deleted = 0 AND retweet_count.parent_id = tweets.id AND retweet_count.type = 'retweet'
            LEFT JOIN tweets AS reply_count ON reply_count.is_deleted = 0 AND reply_count.parent_id = tweets.id AND reply_count.type = 'reply'

            #Parent

            LEFT JOIN tweets AS parent_tweet ON parent_tweet.is_deleted = 0 AND parent_tweet.id = tweets.parent_id
            LEFT JOIN users AS parent_user ON parent_user.id = parent_tweet.user_id
            LEFT JOIN tweets_like AS parent_liked ON parent_liked.user_id = ${authUserId} AND parent_liked.tweets_id = parent_tweet.id
            LEFT JOIN tweets_like AS parent_likes_count ON parent_likes_count.tweets_id = parent_tweet.id
            LEFT JOIN tweets AS parent_retweeted ON parent_retweeted.is_deleted = 0 AND parent_retweeted.user_id = ${authUserId} AND parent_retweeted.parent_id = parent_tweet.id AND parent_retweeted.type = 'retweet'
            LEFT JOIN tweets AS parent_retweet_count ON parent_retweet_count.is_deleted = 0 AND parent_retweet_count.parent_id = parent_tweet.id AND parent_retweet_count.type = 'retweet'
            LEFT JOIN tweets AS parent_reply_count ON parent_reply_count.is_deleted = 0 AND parent_reply_count.parent_id = parent_tweet.id AND parent_reply_count.type = 'reply'

            #Grandparent

            LEFT JOIN tweets AS grandparent_tweet ON grandparent_tweet.is_deleted = 0 AND grandparent_tweet.id = parent_tweet.parent_id
            LEFT JOIN users AS grandparent_user ON grandparent_user.id = grandparent_tweet.user_id
            LEFT JOIN tweets_like AS grandparent_liked ON grandparent_liked.user_id = ${authUserId} AND grandparent_liked.tweets_id = grandparent_tweet.id
            LEFT JOIN tweets_like AS grandparent_likes_count ON grandparent_likes_count.tweets_id = grandparent_tweet.id
            LEFT JOIN tweets AS grandparent_retweeted ON grandparent_retweeted.is_deleted = 0 AND grandparent_retweeted.user_id = ${authUserId} AND grandparent_retweeted.parent_id = grandparent_tweet.id AND grandparent_retweeted.type = 'retweet'
            LEFT JOIN tweets AS grandparent_retweet_count ON grandparent_retweet_count.is_deleted = 0 AND grandparent_retweet_count.parent_id = grandparent_tweet.id AND grandparent_retweet_count.type = 'retweet'
            LEFT JOIN tweets AS grandparent_reply_count ON grandparent_reply_count.is_deleted = 0 AND grandparent_reply_count.parent_id = grandparent_tweet.id AND grandparent_reply_count.type = 'retweet'
        `;
        let values: any[] = [];

        if (page === 'profile_tweet') {
            query += `
                WHERE tweets.is_deleted = 0 AND tweets.type != "reply" AND tweet_user.username = ?
            `;
            values = [username];
        } else if (page === 'profile_retweet') {
            query += `
                WHERE tweets.is_deleted = 0 AND tweets.type = "retweet" AND tweet_user.username = ?
            `;
            values = [username];
        } else if (page === 'profile_quote') {
            query += `
                WHERE tweets.is_deleted = 0 AND tweets.type = "quote" AND tweet_user.username = ?
            `;
            values = [username];
        } else if (page === 'profile_like') {
            query += `
                WHERE tweets.is_deleted = 0 AND ISNULL(liked.id) = 0 AND tweet_user.username = ?
            `;
            values = [username];
        } else if (page === 'tweet') {
            query += `
                WHERE tweets.is_deleted = 0 AND tweets.id = ?
            `;
            values = [tweetId];
        } else if (page === 'reply') {
            query += `
                WHERE tweets.is_deleted = 0 AND tweets.type = "reply" AND tweets.parent_id = ?
            `;
            values = [tweetId];
        } else if (page === 'home' || page == "count") {
            query += `
                WHERE tweets.is_deleted = 0 AND tweets.type != "reply"
            `;
            values = [];
        } else if (page === "hashtag") {
            query += `
                WHERE tweets.id IN (${hashtagTweetsList.join(",")})
            `;
            values = [];
        }

        query += `
            GROUP BY tweets.id
            ORDER BY tweets.id DESC
        `;

        const [tweets]: any = await connection.query(query, values);

        let formattedTweets: any[] = [];

        tweets.forEach((element: any) => {
            element.user = JSON.parse(element.user);
            element.medias = (element.medias ? JSON.parse(element.medias) : []);
            element.parent = (element.parent ? JSON.parse(element.parent) : null);

            if (element.parent) {
                element.parent.medias = (element.parent.medias ? JSON.parse(element.parent.medias) : []);
            }

            if (element.parent?.parent) {
                element.parent.parent.medias = (element.parent.parent.medias ? JSON.parse(element.parent.parent.medias) : []);
            }

            formattedTweets.push(element);
        });

        if (page == "count") {
            return NextResponse.json({ totalCount: formattedTweets.length });
        }

        return NextResponse.json(formattedTweets);
    } catch (error) {
        console.log("Error", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}


export async function DELETE(request: NextRequest) {
    try {
        const { tweetId } = await request.json();
        
        const [tweets] = await connection.query("UPDATE tweets SET is_deleted = ? WHERE id = ?", [true, tweetId]);

        return NextResponse.json(tweets);
    } catch (error) {
        console.log("Error", error);
        return NextResponse.json({ error: 'Erreur interne du serveur' }, { status: 500 });
    }
}