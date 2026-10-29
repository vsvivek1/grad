import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import { auth, authEnabled } from "@/auth";

// Signed-out visitors are sent to /signin (see the `authorized` callback in auth.ts).
const guard = auth as unknown as (req: NextRequest, ev: NextFetchEvent) => Promise<Response>;

export function proxy(request: NextRequest, event: NextFetchEvent) {
  if (!authEnabled) return NextResponse.next();
  return guard(request, event);
}

export const config = {
  matcher: ["/((?!api/auth|_next/static|_next/image|favicon.ico).*)"],
};
