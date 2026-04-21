import { init } from "@sitecore/engage";
import type { Engage } from "@sitecore/engage";

let engagePromise: Promise<Engage> | null = null;

/**
 * Lazily initializes the Engage browser SDK once per tab session.
 * Must only be called from client components (uses `window`).
 */
export function getEngageBrowser(): Promise<Engage> {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("Engage browser SDK must run on the client"));
  }

  const clientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY;
  if (!clientKey) {
    return Promise.reject(new Error("NEXT_PUBLIC_CDP_CLIENT_KEY is not set"));
  }

  if (!engagePromise) {
    engagePromise = init({
      clientKey,
      targetURL:
        process.env.NEXT_PUBLIC_CDP_TARGET_URL ?? "https://api-engage-eu.sitecorecloud.io",
      pointOfSale: process.env.NEXT_PUBLIC_CDP_POINT_OF_SALE ?? "CBRE",
      cookieDomain: window.location.hostname.replace(/^www\./, ""),
      cookieExpiryDays: 365,
      forceServerCookieMode: false,
      includeUTMParameters: true,
      webPersonalization: process.env.NEXT_PUBLIC_CDP_WEB_PERSONALIZATION !== "false",
    });
  }

  return engagePromise;
}
