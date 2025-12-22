import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Các route yêu cầu role ADMIN
const ADMIN_ROUTES = ["/admin"];

// Các route yêu cầu role TEACHER
const TEACHER_ROUTES = ["/lecturer"];

// Các route công khai (không cần đăng nhập)
const PUBLIC_ROUTES = ["/login", "/register", "/forgot-password"];

// Các route tĩnh bỏ qua middleware
const STATIC_ROUTES = ["/_next", "/api", "/favicon.ico", "/uploads"];

interface UserInfo {
  id: string;
  fullName: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "USER";
  avatarUrl: string | null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Bỏ qua các route tĩnh
  if (STATIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Route công khai (login, register): nếu đã đăng nhập thì redirect về home
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    const token = request.cookies.get("AUTH-TOKEN")?.value;
    if (token) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  const token = request.cookies.get("AUTH-TOKEN")?.value;

  // Nếu không có token và đang truy cập route cần xác thực
  if (!token) {
    const isAdminRoute = ADMIN_ROUTES.some((route) =>
      pathname.startsWith(route)
    );
    const isTeacherRoute = TEACHER_ROUTES.some((route) =>
      pathname.startsWith(route)
    );

    if (isAdminRoute || isTeacherRoute) {
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  }

  // Kiểm tra role cho admin routes
  const isAdminRoute = ADMIN_ROUTES.some((route) => pathname.startsWith(route));
  const isTeacherRoute = TEACHER_ROUTES.some((route) =>
    pathname.startsWith(route)
  );

  if (isAdminRoute || isTeacherRoute) {
    try {
      const backendUrl =
        process.env.NEXT_PUBLIC_URL_BACKEND || "http://localhost:8386";

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 5000); // 5s timeout

      const response = await fetch(`${backendUrl}/auth/me`, {
        headers: {
          Cookie: `AUTH-TOKEN=${token}`,
        },
        signal: controller.signal,
      });

      clearTimeout(timeout);

      // Token không hợp lệ hoặc hết hạn
      if (response.status === 401 || response.status === 403) {
        const res = NextResponse.redirect(new URL("/login", request.url));
        res.cookies.delete("AUTH-TOKEN");
        return res;
      }

      if (!response.ok) {
        // Lỗi server (500, etc), không thể xác thực -> Redirect về login an toàn
        console.error("Auth check failed:", response.status);
        const res = NextResponse.redirect(new URL("/login", request.url));
        res.cookies.delete("AUTH-TOKEN");
        return res;
      }

      const user: UserInfo = await response.json();

      // Kiểm tra quyền truy cập
      if (isAdminRoute && user.role !== "ADMIN") {
        // Không có quyền admin -> Redirect về Home (theo yêu cầu)
        return NextResponse.redirect(new URL("/", request.url));
      }

      if (isTeacherRoute && user.role !== "TEACHER" && user.role !== "ADMIN") {
        // Không có quyền teacher -> Redirect về Home
        return NextResponse.redirect(new URL("/", request.url));
      }

      return NextResponse.next();
    } catch (error) {
      console.error("Middleware auth check error:", error);

      // Lỗi mạng, timeout, hoặc lỗi khác -> Fail closed (Redirect về login)
      // Để đảm bảo an toàn, nếu không thể verify token thì không cho vào
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("error", "auth_check_failed");
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|public/).*)",
  ],
};
