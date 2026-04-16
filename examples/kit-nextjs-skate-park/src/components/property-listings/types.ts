import type { PropertyListing, PropertyListingsResponse } from "@/lib/property-listings";

export type SizeRangeValue = [number, number];

export interface PropertyListingsFilters {
  propertyTypes: string[];
  transactionTypes: string[];
  sizeRange: SizeRangeValue;
}

export interface PropertySearchLocation {
  label: string;
  center: {
    lat: number;
    lng: number;
  };
  bounds?: {
    north: number;
    south: number;
    east: number;
    west: number;
  };
}

export interface PropertyListingsPageProps {
  initialData: PropertyListingsResponse;
  errorMessage?: string;
}

export interface PropertyMapViewportBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

export type { PropertyListing, PropertyListingsResponse };
