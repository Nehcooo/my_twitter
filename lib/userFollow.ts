"use client";

import { useEffect, useState } from "react";
import { UserProfile } from "@/app/types/user";

export function userFollow(userId: number | null, type: "followers" | "following") {
    const [data, setData] = useState<UserProfile[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!userId) return;

        const fetchData = async () => {
            try {
                setIsLoading(true);

                const res = await fetch(`/api/users/follow?page=${type}&userId=${userId}`, {
                    method: "GET",
                    credentials: "include",
                });

                if (!res.ok) {
                    throw new Error(`Erreur lors de la récupération des ${type}`);
                }

                const result = await res.json();
                console.log(`Data for ${type}:`, result);
                setData(result[type] || []);
            } catch (error) {
                console.error(`Erreur lors de la récupération des ${type} :`, error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, [userId, type]);

    return { data, isLoading };
}
