import { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { decodeUserId } from "@/lib/decodeUserId";

export async function GET(request: NextRequest) {
    try {
        const token = request.cookies.get('token')?.value;

        if (!token) {
            return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 }); 
        }

        const user = decodeUserId(token);

        return NextResponse.json({ id: user?.id });
    } catch (error) {
        console.log('Erreur lors de la récupération des données :', error);
        return NextResponse.json({ error: 'Erreur lors de la récupération des données' }, { status: 500 });
    }

}
