"use server";

import { cookies } from "next/headers";
import { decodeUserId } from "@/lib/decodeUserId";

export async function GetUserId(): Promise<number | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return null;

    const user = decodeUserId(token);

    return user?.id || null;
}