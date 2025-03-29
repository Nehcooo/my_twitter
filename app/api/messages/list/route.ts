import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/db";
import { GetUserId } from "@/lib/user";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const currentUserId = await GetUserId();

    let query = `
      SELECT 
        u.id,
        u.username,
        u.firstname,
        u.lastname,
        u.icon,

        -- Dernier message (contenu)
        (
          SELECT m.message
          FROM message m
          WHERE 
            (m.from_user_id = u.id AND m.to_user_id = ?) 
            OR 
            (m.from_user_id = ? AND m.to_user_id = u.id)
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as lastMessage,

        -- Date du dernier message
        (
          SELECT m.created_at
          FROM message m
          WHERE 
            (m.from_user_id = u.id AND m.to_user_id = ?) 
            OR 
            (m.from_user_id = ? AND m.to_user_id = u.id)
          ORDER BY m.created_at DESC
          LIMIT 1
        ) as lastMessageDate,

        -- Nombre de messages non lus pour cette conversation
        (
          SELECT COUNT(*)
          FROM message m
          WHERE 
            m.from_user_id = u.id
            AND m.to_user_id = ?
            AND m.unread = 1
        ) as unreadCount

      FROM users u
      WHERE u.id != ?
    `;

    const values: any[] = [
      currentUserId, currentUserId,
      currentUserId, currentUserId,
      currentUserId,                
      currentUserId                 
    ];

    if (search.trim()) {
      query += `
        AND (
          u.username LIKE ?
          OR u.firstname LIKE ?
          OR u.lastname LIKE ?
        )
      `;
      const like = `%${search.trim()}%`;
      values.push(like, like, like);
    }

    query += " ORDER BY lastMessageDate DESC";

    const [rows] = await connection.query(query, values);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erreur GET /api/messages/list :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
