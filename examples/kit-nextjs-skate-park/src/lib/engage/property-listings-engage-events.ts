import { getEngageBrowser } from "@/lib/engage/engage-browser";

const PAGE = "Property Listings";

type PayloadValue = string | number | boolean | null | undefined | string[];

type EngagePayload = Record<string, PayloadValue>;

/** Engage `extensionData` must not use `null` (SDK nested object typing). */
type EngageExtension = Record<string, string | number | boolean>;

async function sendEngageCustomEvent(
  locale: string,
  eventType: string,
  data: EngagePayload,
  extensionData?: EngageExtension
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_CDP_CLIENT_KEY) {
    return;
  }

  try {
    const engage = await getEngageBrowser();
    await engage.event(
      eventType,
      {
        channel: "WEB",
        currency: "USD",
        language: locale,
        page: PAGE,
        pointOfSale: process.env.NEXT_PUBLIC_CDP_POINT_OF_SALE ?? "CBRE",
        ...data,
      },
      extensionData
    );
  } catch (error) {
    console.debug("[Engage]", eventType, error);
  }
}

/** User picked a place from autosuggest or submitted a text search (Enter). */
export function trackPropertySearch(
  locale: string,
  payload: {
    search_mode: "location" | "text";
    query?: string;
    place_id?: string;
    location_label?: string;
    center_lat?: number;
    center_lng?: number;
    has_bounds?: boolean;
    filtered_listing_count: number;
    visible_listing_count: number;
    total_source_listings: number;
  }
): Promise<void> {
  return sendEngageCustomEvent(locale, "property_search", payload);
}

/** Filters (types, transaction, size) changed. */
export function trackPropertyFilterChanged(
  locale: string,
  payload: {
    property_types: string;
    transaction_types: string;
    size_min: number;
    size_max: number;
    size_unit: string;
    filtered_listing_count: number;
    visible_listing_count: number;
    total_source_listings: number;
  }
): Promise<void> {
  return sendEngageCustomEvent(locale, "property_filter_changed", payload);
}

/** Sort order changed. */
export function trackPropertySortChanged(
  locale: string,
  payload: {
    sort_from: string;
    sort_to: string;
    result_count: number;
    total_source_listings: number;
  }
): Promise<void> {
  return sendEngageCustomEvent(locale, "property_sort_changed", payload);
}

/** User selected a listing card or map marker. */
export function trackPropertyCardClicked(
  locale: string,
  payload: {
    property_id: string;
    property_title: string;
    property_type: string;
    property_sub_type: string;
    transaction_type: string;
    city: string;
    region: string;
    country: string;
    address_label: string;
    click_source: "results_list" | "map_marker";
    list_index: number;
    current_page: number;
    page_size: number;
  }
): Promise<void> {
  return sendEngageCustomEvent(locale, "property_card_clicked", payload);
}

const INQUIRY_EXT: EngageExtension = { inquiry_category: "PROPERTY_INQUIRY" };

/** User focused the email / inquiry capture field. */
export function trackLeadFormStarted(locale: string): Promise<void> {
  return sendEngageCustomEvent(
    locale,
    "lead_form_started",
    {
      form_id: "property_listings_email_capture",
      form_location: PAGE,
    },
    INQUIRY_EXT
  );
}

/** User successfully submitted the email capture (after identity succeeds). */
export function trackLeadFormSubmitted(
  locale: string,
  payload: { email_domain: string }
): Promise<void> {
  return sendEngageCustomEvent(
    locale,
    "lead_form_submitted",
    {
      form_id: "property_listings_email_capture",
      form_location: PAGE,
      ...payload,
    },
    INQUIRY_EXT
  );
}
