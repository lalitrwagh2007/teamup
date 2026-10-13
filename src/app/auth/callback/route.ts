import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? requestUrl.origin;

  return NextResponse.redirect(new URL("/dashboard", origin));
}