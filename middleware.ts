import { auth } from "./auth"
import { NextResponse } from "next/server"

export default auth((req) => {
    const isLoggedIn = !!req.auth
    const protectedPaths = ['/dashboard', '/vehicles', '/trips', '/maintenance', '/analytics', '/drivers', '/fuel']
    const isOnProtected = protectedPaths.some(p => req.nextUrl.pathname.startsWith(p))

    if (isOnProtected && !isLoggedIn) {
        return NextResponse.redirect(new URL('/login', req.nextUrl))
    }

    if (isLoggedIn && req.nextUrl.pathname === '/login') {
        return NextResponse.redirect(new URL('/dashboard', req.nextUrl))
    }

    return NextResponse.next()
})

export const config = {
    matcher: ['/((?!api/auth|_next/static|_next/image|favicon.ico).*)'],
}
