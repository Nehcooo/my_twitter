// app/api/auth/signup/route.ts
import { NextResponse } from 'next/server';
import connection from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const { username, lastname, firstname, email, password, birthdate } = await req.json();

        if (!username || !lastname || !firstname || !email || !password || !birthdate) {
            return NextResponse.json({ message: 'Tous les champs sont requis' }, { status: 400 });
        }

        const [rows] = await connection.execute('SELECT id FROM users WHERE email = ?', [email]);
        if ((rows as any).length > 0) {
            return NextResponse.json({ message: 'Email déjà utilisé' }, { status: 409 });
        }

        const hashedPwd = await bcrypt.hash(password, 10);

        await connection.execute(
            'INSERT INTO users (username, lastname, firstname, email, password, birthdate) VALUES (?, ?, ?, ?, ?, ?)',
            [username, lastname, firstname, email, hashedPwd, birthdate]
        );

        return NextResponse.json({ message: 'Utilisateur créé avec succès' }, { status: 201 });
    } catch (error) {
        console.error('Erreur lors de la création de l\'utilisateur:', error);
        return NextResponse.json({ message: 'Erreur interne du serveur' }, { status: 500 });
    }
}
