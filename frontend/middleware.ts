import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import jwt from "jsonwebtoken"

const protectedRoutes = ["/admin", "/teacher", "/student"]

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (
    pathname.startsWith("/login") ||
    pathname.startsWith("/register") ||
    pathname === "/"
  ) {
    return NextResponse.next()
  }

  const isProtectedRoute = protectedRoutes.some((route) =>
    pathname.startsWith(route)
  )
  if (!isProtectedRoute) {
    return NextResponse.next()
  }

  const token = req.cookies.get("accessToken")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  try {
    const secret = process.env.JWT_SECRET || "your-secret-key"
    if (!secret) throw new Error("Missing JWT secret")

    const payload = jwt.verify(token, secret) as {
      id: string
      role: "admin" | "teacher" | "student"
      collegeId?: string
    }

    if (pathname.startsWith("/admin") && payload.role !== "admin") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (pathname.startsWith("/teacher") && payload.role !== "teacher") {
      return NextResponse.redirect(new URL("/", req.url))
    }
    if (pathname.startsWith("/student") && payload.role !== "student") {
      return NextResponse.redirect(new URL("/", req.url))
    }

    return NextResponse.next()
  } catch (error) {
    console.error("Token verification error:", error)
    return NextResponse.redirect(new URL("/login", req.url))
  }
}

export const config = {
  matcher: ["/admin/:path*", "/teacher/:path*", "/student/:path*"],
}
