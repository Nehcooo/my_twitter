import { NextResponse, NextRequest } from "next/server";
import connection from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { userId } = body;
        let query;
        let values;

        query = `UPDATE users SET is_deleted = true WHERE id = ?`;
        values = [userId];


        const [usersUpdate] = await connection.query(query, values);
        return NextResponse.json(usersUpdate);
    } catch (error) {
        console.log('error', error);
        return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
    }
}