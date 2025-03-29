import jwt from "jsonwebtoken";

const SECRET_KEY = process.env.JWT_SECRET || "";

interface TokenPayload {
    id?: number;
    email?: string;
}

export function decodeUserId(token: string): TokenPayload | null {
    try {
        const payload = jwt.verify(token, SECRET_KEY) as TokenPayload;
        return payload;
    } catch (error) {
        console.error("Erreur lors du décodage du token :", error);
        return null;
    }
}