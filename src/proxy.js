import { NextResponse } from "next/server";

export function proxy() {
  const response = NextResponse.next();
  response.headers.set("x-builder-apps-proxy", "active");
  return response;
}

export const config = {
  matcher: "/middleware-check",
};
