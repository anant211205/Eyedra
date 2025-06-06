import { getToken } from 'next-auth/jwt'
import { NextResponse, type NextRequest } from 'next/server'


export async function middleware(request: NextRequest) {
    const token = await getToken({req: request}) ;
    const url = request.nextUrl ;
    if (token && (url.pathname.startsWith('/signin') ||
            url.pathname.startsWith('/register') )
    ){
        return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    if(!token && url.pathname.startsWith('/dashboard')) {
        return NextResponse.redirect(new URL('/signin', request.url));
    }
    return NextResponse.next();
}

export const config = {
    matcher: [
        '/dashboard/:path*',
        '/dashboard',
        '/signin',
        '/register',
    ],
}