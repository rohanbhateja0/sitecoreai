import type { Metadata } from "next";
import { PropertyListingsPage } from "@/components/property-listings/PropertyListingsPage";
import { getPropertyListings } from "@/lib/property-listings";
import type { PropertyListingsResponse } from "@/components/property-listings/types";

export const metadata: Metadata = {
  title: "Property Listings",
  description: "Browse CBRE property listings with a live map, autosuggest search, filters, and pagination.",
};

const EMPTY_PROPERTY_DATA: PropertyListingsResponse = {
  total: 0,
  listings: [],
  propertyTypes: [],
  transactionTypes: [],
  sizeRange: {
    min: 0,
    max: 0,
    unit: "sqft",
  },
};

export default async function PropertyListingsRoute() {
  try {
    const data = await getPropertyListings();
    return <PropertyListingsPage initialData={data} />;
  } catch (error) {
    return (
      <PropertyListingsPage
        initialData={EMPTY_PROPERTY_DATA}
        errorMessage={
          error instanceof Error
            ? error.message
            : "Property listings are temporarily unavailable. Please try again later."
        }
      />
    );
  }
}
