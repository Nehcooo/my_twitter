import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const token = request.cookies.get('token')?.value;

    console.log(`Middleware exécuté pour: ${pathname}`);
    console.log(`Token trouvé: ${token ? 'Oui' : 'Non'}`);

    const publicPaths = ['/auth/login', '/auth/signup'];

    const isPublicResource =
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname.startsWith('/img');

    if (isPublicResource) {
        console.log('Accès libre aux ressources statiques');
        return NextResponse.next();
    }

    if (token && publicPaths.includes(pathname)) {
        console.log('Utilisateur connecté, redirection vers /home depuis une page d\'authentification');
        return NextResponse.redirect(new URL('/home', request.url));
    }

    if (!token && !publicPaths.includes(pathname)) {
        console.log('Utilisateur non connecté, redirection vers /auth/login');
        return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    if (pathname === '/' && token) {
        console.log('Utilisateur connecté, redirection vers /home');
        return NextResponse.redirect(new URL('/home', request.url));
    }

    if (token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                atob(base64)
                    .split('')
                    .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );

            const decodedToken = JSON.parse(jsonPayload);
            const userId = decodedToken.userId;
            console.log(`ID Utilisateur récupéré : ${userId}`);

            // Ajouter l'ID utilisateur en tant qu'en-tête personnalisé
            const response = NextResponse.next();
            response.headers.set('x-user-id', userId);
            return response;

        } catch (error) {
            console.log('Erreur lors de la décodage du token :', error);
            return NextResponse.redirect(new URL('/auth/login', request.url));
        }
    }

    return NextResponse.next();
}

// Configurer le middleware uniquement sur les chemins nécessaires
export const config = {
    matcher: [
        '/',
        '/home',
        '/profiles/:path*',
        '/message/:path*',
        '/tweet/:path*',
        '/auth/login',
        '/auth/signup',
    ],
};
