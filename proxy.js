// Our own route guard (Next.js 16 renamed the "middleware" file to "proxy").
// It does not use Supabase Auth: it reads our tutormatch_session cookie and checks it
// against the sessions table, then decides who may open each page.
import { NextResponse } from "next/server";
import { SESSION_COOKIE, getSessionFromToken } from "@/lib/auth/session";

// Which role may open each page. "any" = any logged-in user.
const RULES = [
  { prefix: "/saved", role: "student" },
  { prefix: "/tutors", role: "student" },
  { prefix: "/requests", role: "tutor" },
  { prefix: "/profile", role: "tutor" },
  { prefix: "/chat", role: "any" },
];
const GUEST_ONLY = ["/login", "/register"];

const homeFor = (role) => (role === "tutor" ? "/requests" : "/");

function matches(pathname, rule) {
  if (rule.exact) return pathname === rule.prefix;
  return pathname === rule.prefix || pathname.startsWith(`${rule.prefix}/`);
}

export async function proxy(request) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;

  let session = null;
  try {
    session = token ? await getSessionFromToken(token) : null;
  } catch (error) {
    // If Supabase is unreachable, let the page render and show its own error.
    console.error("proxy session check failed", error?.message || "unknown");
    return NextResponse.next();
  }

  if (GUEST_ONLY.includes(pathname)) {
    return session ? NextResponse.redirect(new URL(homeFor(session.role), request.url)) : NextResponse.next();
  }

  // Tutors have no swipe page; send them to their requests.
  if (pathname === "/" && session?.role === "tutor") {
    return NextResponse.redirect(new URL("/requests", request.url));
  }

  const rule = RULES.find((r) => matches(pathname, r));
  if (!rule) return NextResponse.next();

  if (!session) {
    const login = new URL("/login", request.url);
    login.searchParams.set("next", pathname + search);
    return NextResponse.redirect(login);
  }
  if (rule.role !== "any" && rule.role !== session.role) {
    return NextResponse.redirect(new URL(homeFor(session.role), request.url));
  }

  return NextResponse.next();
}

export const config = {
  // Skip API routes (they check the session themselves) and static files.
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:png|jpg|jpeg|gif|svg|webp|ico)$).*)"],
};
