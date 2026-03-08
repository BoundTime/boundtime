import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options);
          });
        }
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const requestHeaders = new Headers(request.headers);
  if (user) {
    requestHeaders.set("x-bt-user-id", user.id);
    const { data: profile } = await supabase
      .from("profiles")
      .select("account_type, restriction_enabled")
      .eq("id", user.id)
      .single();
    requestHeaders.set("x-bt-account-type", profile?.account_type ?? "");
    requestHeaders.set("x-bt-restriction-enabled", profile?.restriction_enabled ? "1" : "0");
  }

  if (request.nextUrl.pathname.startsWith("/dashboard") && !user) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  if (
    (request.nextUrl.pathname === "/login" || request.nextUrl.pathname === "/register") &&
    user
  ) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  const out = NextResponse.next({ request: { headers: requestHeaders } });
  response.headers.getSetCookie?.()?.forEach((v) => out.headers.append("Set-Cookie", v));
  return out;
}

export const config = {
  // Session auf allen Routen refreshen, damit Layouts/API die gleichen Cookies sehen (nicht nur /dashboard)
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
