import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/db";


export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const fromUser = Number(searchParams.get("fromUser"));
    const toUser = Number(searchParams.get("toUser"));

    if (!fromUser || !toUser) {
      return NextResponse.json({ error: "Paramètres manquants (fromUser, toUser)" }, { status: 400 });
    }

    const query = `
      SELECT 
        id,
        type,
        from_user_id,
        to_user_id,
        message,
        medias,   -- On récupère la colonne 'medias'
        unread,
        is_deleted,
        read_at,
        created_at
      FROM message
      WHERE
          (from_user_id = ? AND to_user_id = ?)
      ORDER BY created_at ASC
    `;
    const values = [fromUser, toUser, toUser, fromUser];
    const [rows] = await connection.query(query, values);

    const messages = Array.isArray(rows)
      ? rows.map((msg: any) => ({
          ...msg,
          medias: msg.medias ? JSON.parse(msg.medias) : [],
        }))
      : [];

    const markReadQuery = `
      UPDATE message
      SET unread = 0
      WHERE to_user_id = ?
      AND from_user_id = ?
    `;
    await connection.query(markReadQuery, [fromUser, toUser]);

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Erreur GET /api/messages/conversation :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { from_user_id, to_user_id, message, medias } = body;


    if (!from_user_id || !to_user_id) {
      return NextResponse.json({ error: "Paramètres manquants" }, { status: 400 });
    }

    const mediasJSON = medias ? JSON.stringify(medias) : null;

    const insertQuerySender = `
      INSERT INTO message (type, from_user_id, to_user_id, message, medias, unread, is_deleted, created_at)
      VALUES ('sender', ?, ?, ?, ?, 1, 0, NOW())
    `;
    const [resultSender]: any = await connection.query(insertQuerySender, [
      from_user_id,
      to_user_id,
      message || "",
      mediasJSON,
    ]);

    const insertedId = resultSender?.insertId;


    const insertQueryReceiver = `
      INSERT INTO message (type, from_user_id, to_user_id, message, medias, unread, is_deleted, created_at)
      VALUES ('receiver', ?, ?, ?, ?, 1, 0, NOW())
    `;
    await connection.query(insertQueryReceiver, [
      to_user_id,
      from_user_id,
      message || "",
      mediasJSON,
    ]);

    if (!insertedId) {
      return NextResponse.json({ error: "Aucun ID inséré" }, { status: 500 });
    }

    const newMessage = {
      id: insertedId,
      type: "sender",
      from_user_id,
      to_user_id,
      message,
      medias: medias || [],
      unread: 1,
      created_at: new Date().toISOString(),
    };

    return NextResponse.json(newMessage, { status: 201 });
  } catch (error) {
    console.error("Erreur POST /api/messages/conversation :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
