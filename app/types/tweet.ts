type TweetMedias = { type: string, url: string };
type TweetUser = { id: number, firstname: string, lastname: string, icon: string, username: string };

export default interface Tweet {
  type?: string;
  tweet_id?: number;
  tweet_created_at?: string;
  tweet?: string;
  liked?: boolean;
  likes_count?: number;
  retweeted?: boolean;
  retweet_count?: number;
  reply_count?: number;
  medias?: TweetMedias[];
  user?: TweetUser;
  parent?: Tweet;
}