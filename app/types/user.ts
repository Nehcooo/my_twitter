export type UserProfile = {
    id: number;
    username: string;
    lastname: string;
    firstname: string;
    email: string;
    bio: string;
    icon?: string;
    banner?: string;
    github?: string;
    linkedin?: string;
    website?: string;
    created_at?: number;
    following_count?: number;
    followed_count?: number;
};