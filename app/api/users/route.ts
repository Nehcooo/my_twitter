import { NextRequest, NextResponse } from "next/server";
import connection from "@/lib/db"; // Adapte si besoin au chemin de ta connexion MySQL

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const currentUserId = searchParams.get("currentUserId");

    // On exclut l'utilisateur connecté
    let query = `
      SELECT 
        id,
        username,
        firstname,
        lastname,
        icon
      FROM users
      WHERE id != ?
    `;
    const values: (number | string)[] = [Number(currentUserId)];

    // Si on tape quelque chose dans la barre de recherche
    // on filtre sur username, firstname ou lastname
    if (search.trim() !== "") {
      query += `
        AND (
          username LIKE ?
          OR firstname LIKE ?
          OR lastname LIKE ?
        )
      `;
      const like = `%${search.trim()}%`;
      values.push(like, like, like);
    }

    // Pour un affichage ordonné
    query += " ORDER BY username ASC";

    const [rows] = await connection.query(query, values);
    return NextResponse.json(rows);
  } catch (error) {
    console.error("Erreur GET /api/users :", error);
    return NextResponse.json({ error: "Erreur interne" }, { status: 500 });
  }
}
