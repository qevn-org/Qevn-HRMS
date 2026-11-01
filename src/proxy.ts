import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getRoleFromUser, ROLE_PROTECTED_ROUTES } from '@/lib/auth/roles';

const PUBLIC_PATHS = ['/login'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // Fail closed: without auth configuration nothing but the login page is served.
  if (!url || !anonKey) {
    return pathname === '/login'
      ? NextResponse.next()
      : NextResponse.redirect(new URL('/login', request.url));
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  // getUser() validates the JWT with the Supabase Auth server (getSession() does not).
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const isPublic = PUBLIC_PATHS.includes(pathname);

  if (!user && !isPublic) {
    return NextResponse.redirect(new URL('/login', request.url));
  }
  if (user && isPublic) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  if (user) {
    const role = getRoleFromUser(user);
    const rule = ROLE_PROTECTED_ROUTES.find(
      (r) => pathname === r.prefix || pathname.startsWith(`${r.prefix}/`)
    );
    if (rule && !rule.roles.includes(role)) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png|.*\\.(?:png|jpg|jpeg|svg|webp|ico)$).*)'],
};
