import { NextResponse, type NextRequest } from "next/server";

/**
 * Optional shared password. When SITE_PASSWORD is set, every request
 * (pages and the JS bundle that carries the list) needs HTTP Basic auth.
 * Any username works. When it is not set, the site is open.
 */
export function proxy(request: NextRequest) {
  const password = process.env.SITE_PASSWORD;
  if (!password) return NextResponse.next();

  const header = request.headers.get("authorization") ?? "";
  if (header.startsWith("Basic ")) {
    const decoded = atob(header.slice(6));
    const given = decoded.slice(decoded.indexOf(":") + 1);
    if (given === password) return NextResponse.next();
  }
  return new NextResponse("Password required", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="KSEB AE Gradation", charset="UTF-8"' },
  });
}
