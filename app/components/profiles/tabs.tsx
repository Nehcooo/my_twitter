import { useState } from "react"
import Tweets from "../tweet/Tweets";


export default function Tabs() {
    const [activeTab, setActiveTab] = useState(0);

    const tabs = ['Tweet', 'Retweet', 'Réponse', 'Like'];
    const contents = [
        <Tweets hashtag={null} refreshTweets={null} page="profile_tweet" />,
        <Tweets hashtag={null} refreshTweets={null} page="profile_retweet" />,
        <Tweets hashtag={null} refreshTweets={null} page="profile_quote" />,
        <Tweets hashtag={null} refreshTweets={null} page="profile_like" />,
    ];

    return (
        <>
            <div className="w-full rounded-xl">
                <ul className="pt-7 pb-7 flex flex-row items-center justify-center gap-20 py-3 border-b-2 border-(--border-grey-light)">
                    {tabs.map((tab, index) => (
                        <li key={index}>
                            <button
                                onClick={() => setActiveTab(index)}
                                className={`relative cursor-pointer after:content-[""] after:transition-all after:delay-150 after:duration-300 after:ease-in-out after:block after:relative after:top-1 after:h-[3px] after:rounded-xl after:w-[0px] after:bg-(--blue) ${activeTab === index ? 'after:w-full' : 'text-gray-500'}`}
                            >
                                {tab}
                            </button>
                        </li>

                    ))}
                </ul>

                <div className="pb-10">
                    {contents.map((content, index) => (
                        <div key={index}>
                            {activeTab === index ? <div key={index}>{content}</div> : null}
                        </div>
                    ))}
                </div>
            </div>
        </>
    )
}