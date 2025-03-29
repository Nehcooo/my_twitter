'use client';

import Header from "@/app/components/Header";
import Profile from "@/app/components/Profile";
import Trends from "@/app/components/Trends";
import Tweets from "@/app/components/tweet/Tweets";
import { useParams } from "next/navigation"


export default function Hashtags() {
    const params = useParams<{ hashtag: string }>();
    const hashtag = params?.hashtag;


    return (
        <>
            <div className="w-[90%] [@media(min-width:987px)]:w-[50%] m-auto">
                <Tweets refreshTweets={null} hashtag={hashtag} page="hashtag" />
            </div>
        </>
    )
}