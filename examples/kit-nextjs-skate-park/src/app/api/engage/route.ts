import { NextResponse } from "next/server";

/**
 * Lightweight health/config probe for CDP Engage env wiring.
 * The Engage browser SDK is initialized from client code, not from this route.
 */
export function GET() {
  return NextResponse.json({
    cdpClientKeyConfigured: Boolean(process.env.NEXT_PUBLIC_CDP_CLIENT_KEY),
  });
}
