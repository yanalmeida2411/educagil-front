import {
  NextResponse,
  type MiddlewareConfig,
  type NextRequest,
} from "next/server";

const publicRoutes = [
  { path: "/login", whenAuthenticated: "redirect" },
  { path: "/register", whenAuthenticated: "redirect" },
  { path: "/registerValid", whenAuthenticated: "next" }, 
  { path: "/email_password_recovery", whenAuthenticated: "next" },
  { path: "/password-reset-confirm", whenAuthenticated: "next" },
] as const;

const REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE = "/login";

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const publicRoute = publicRoutes.find((route) => route.path === path);

  const encodedToken = request.cookies.get("@educagil.token")?.value;
  let accessToken = null;

  if (encodedToken) {
    try {
      const decoded = decodeURIComponent(encodedToken);
      const parsed = JSON.parse(decoded);
      accessToken = parsed.access;
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
    }
  }

  if (!accessToken && publicRoute) {
    return NextResponse.next();
  }

  if (!accessToken && !publicRoute) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE;
    return NextResponse.redirect(redirectUrl);
  }

  if (
    accessToken &&
    publicRoute &&
    publicRoute.whenAuthenticated === "redirect"
  ) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/";
    return NextResponse.redirect(redirectUrl);
  }
  return NextResponse.next();
}

export const config: MiddlewareConfig = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*(?<!\\.[^/]+))",
  ],
};
