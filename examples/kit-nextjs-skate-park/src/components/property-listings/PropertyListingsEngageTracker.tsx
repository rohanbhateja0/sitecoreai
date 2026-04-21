"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { getEngageBrowser } from "@/lib/engage/engage-browser";

type PropertyListingsEngageTrackerProps = {
  locale: string;
  /** Human-readable page label sent to CDP as the `page` field */
  pageLabel?: string;
};

/**
 * Sends a single Engage CDP page view when the property listings experience mounts.
 * Skips when the CDP client key is not configured.
 */
export function PropertyListingsEngageTracker({
  locale,
  pageLabel = "Property Listings",
}: PropertyListingsEngageTrackerProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_CDP_CLIENT_KEY) {
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const engage = await getEngageBrowser();
        if (cancelled) {
          return;
        }

        await engage.pageView(
          {
            channel: "WEB",
            currency: "USD",
            page: pageLabel,
            language: locale,
          },
          pathname ? { path: pathname } : undefined
        );
      } catch (error) {
        console.debug("[Engage] property listings pageView skipped or failed", error);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [locale, pageLabel, pathname]);

  return null;
}
