import type { Metadata } from "next";
import CBREFooter from "@/components/cbre-footer/CBREFooter";
import CBREHeader from "@/components/cbre-header/CBREHeader";
import { PropertyListingsPage } from "@/components/property-listings/PropertyListingsPage";
import { getPropertyListings } from "@/lib/property-listings";
import type { PropertyListingsResponse } from "@/components/property-listings/types";
import type { CBREHeaderNavItem } from "@/types/cbre-header";

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

type PropertyListingsRouteProps = {
  params: Promise<{
    site: string;
    locale: string;
  }>;
};

function renderPropertyListingsShell(
  content: React.ReactNode,
  homeHref: string,
  propertyListingsHref: string
) {
  const headerItems: readonly CBREHeaderNavItem[] = [
    { label: "Services", href: "#" },
    { label: "Insight & Research", href: "#" },
    { label: "Properties", href: "/property-listings" },
    { label: "Offices", href: "#" },
    { label: "Careers", href: "/" },
    { label: "About Us", href: "/" },
  ];

  return (
    <>
      <CBREHeader
        items={headerItems}
        homeHref={"/"}
        searchHref={propertyListingsHref}
      />
      {content}
      <CBREFooter homeHref={homeHref} />
    </>
  );
}

export default async function PropertyListingsRoute({ params }: PropertyListingsRouteProps) {
  const { site, locale } = await params;
  const homeHref = `/${site}/${locale}`;
  const propertyListingsHref = `${homeHref}/property-listings`;

  try {
    const data = await getPropertyListings();
    return renderPropertyListingsShell(
      <PropertyListingsPage initialData={data} />,
      homeHref,
      propertyListingsHref
    );
  } catch (error) {
    return renderPropertyListingsShell(
      <PropertyListingsPage
        initialData={EMPTY_PROPERTY_DATA}
        errorMessage={
          error instanceof Error
            ? error.message
            : "Property listings are temporarily unavailable. Please try again later."
        }
      />,
      homeHref,
      propertyListingsHref
    );
  }
}
