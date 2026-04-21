"use client";

import { useEffect, useMemo, useState } from "react";
import { PropertyFilters } from "./PropertyFilters";
import { PropertyMap } from "./PropertyMap";
import { PropertyPagination } from "./PropertyPagination";
import { PropertyResultsList } from "./PropertyResultsList";
import { PropertyListingsIdentityForm } from "./PropertyListingsIdentityForm";
import { PropertySearchBox } from "./PropertySearchBox";
import type {
  PropertyListing,
  PropertyListingsFilters,
  PropertyMapViewportBounds,
  PropertyListingsPageProps,
  PropertySearchLocation,
} from "./types";

const PAGE_SIZE = 6;
const EARTH_RADIUS_KM = 6371;

function createDefaultFilters(initialData: PropertyListingsPageProps["initialData"]): PropertyListingsFilters {
  return {
    propertyTypes: [],
    transactionTypes: [],
    sizeRange: [initialData.sizeRange.min, initialData.sizeRange.max],
  };
}

function getDistanceInKm(
  start: { lat: number; lng: number },
  end: { lat: number; lng: number }
): number {
  const dLat = ((end.lat - start.lat) * Math.PI) / 180;
  const dLng = ((end.lng - start.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((start.lat * Math.PI) / 180) *
      Math.cos((end.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function matchesQuery(property: PropertyListing, query: string): boolean {
  if (!query.trim()) {
    return true;
  }

  const searchableText = [
    property.title,
    property.propertyType,
    property.propertySubType,
    property.transactionType,
    property.addressLabel,
    property.city,
    property.region,
    property.country,
    property.postCode,
  ]
    .join(" ")
    .toLowerCase();

  return query
    .toLowerCase()
    .split(/[,\s]+/)
    .filter((token) => token.length > 1)
    .every((token) => searchableText.includes(token));
}

function matchesLocation(property: PropertyListing, location: PropertySearchLocation | null): boolean {
  if (!location) {
    return true;
  }

  if (location.bounds) {
    return (
      property.latitude >= location.bounds.south &&
      property.latitude <= location.bounds.north &&
      property.longitude >= location.bounds.west &&
      property.longitude <= location.bounds.east
    );
  }

  return (
    getDistanceInKm(location.center, { lat: property.latitude, lng: property.longitude }) <= 75
  );
}

export function PropertyListingsPage({
  initialData,
  errorMessage,
  locale = "en",
}: PropertyListingsPageProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<PropertySearchLocation | null>(null);
  const [viewportBounds, setViewportBounds] = useState<PropertyMapViewportBounds | null>(null);
  const [filters, setFilters] = useState(createDefaultFilters(initialData));
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    initialData.listings[0]?.id || null
  );

  const effectiveQuery =
    selectedLocation && searchQuery.trim() === selectedLocation.label ? "" : searchQuery.trim();

  const filteredByControls = useMemo(() => {
    return initialData.listings.filter((property) => {
      const comparableSize = property.minSizeValue ?? property.totalSizeValue ?? 0;
      const matchesPropertyType =
        !filters.propertyTypes.length || filters.propertyTypes.includes(property.propertyType);
      const matchesTransactionType =
        !filters.transactionTypes.length ||
        filters.transactionTypes.includes(property.transactionType);
      const matchesSize =
        comparableSize >= filters.sizeRange[0] && comparableSize <= filters.sizeRange[1];

      return (
        matchesPropertyType &&
        matchesTransactionType &&
        matchesSize &&
        matchesQuery(property, effectiveQuery)
      );
    });
  }, [effectiveQuery, filters, initialData.listings]);

  const filteredProperties = useMemo(() => {
    if (!selectedLocation) {
      return filteredByControls;
    }

    const nearbyProperties = filteredByControls.filter((property) =>
      matchesLocation(property, selectedLocation)
    );

    return nearbyProperties.length ? nearbyProperties : filteredByControls;
  }, [filteredByControls, selectedLocation]);

  const visibleProperties = useMemo(() => {
    if (!viewportBounds) {
      return filteredProperties;
    }

    return filteredProperties.filter(
      (property) =>
        property.latitude >= viewportBounds.south &&
        property.latitude <= viewportBounds.north &&
        property.longitude >= viewportBounds.west &&
        property.longitude <= viewportBounds.east
    );
  }, [filteredProperties, viewportBounds]);

  const totalPages = Math.max(1, Math.ceil(visibleProperties.length / PAGE_SIZE));

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return visibleProperties.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, visibleProperties]);

  useEffect(() => {
    setCurrentPage(1);
    setViewportBounds(null);
  }, [filters, searchQuery, selectedLocation]);

  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(totalPages);
    }
  }, [currentPage, totalPages]);

  useEffect(() => {
    if (!visibleProperties.some((property) => property.id === selectedPropertyId)) {
      setSelectedPropertyId(visibleProperties[0]?.id || null);
    }
  }, [visibleProperties, selectedPropertyId]);

  return (
    <div className="bg-slate-50">
      <div className="mx-auto max-w-[1600px] px-4 py-10 md:px-6 xl:px-8">
        <div className="mb-8 max-w-3xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            CBRE Property Listings
          </p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight text-slate-900">
            Search property listings
          </h1>
          <p className="mt-4 text-base text-slate-600 md:text-lg">
            Browse listings, narrow them by type and size, and keep the map and results list in
            sync.
          </p>
        </div>

        {errorMessage ? (
          <div className="mb-6 rounded-2xl border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            {errorMessage}
          </div>
        ) : null}

        <PropertyListingsIdentityForm locale={locale} />

        <div className="grid gap-8 xl:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]">
          <section className="min-w-0 space-y-5 xl:sticky xl:top-6 xl:self-start">
            <PropertySearchBox
              value={searchQuery}
              onChange={setSearchQuery}
              onLocationSelect={setSelectedLocation}
            />

            <PropertyMap
              properties={filteredProperties}
              selectedPropertyId={selectedPropertyId}
              focusLocation={selectedLocation}
              onSelectProperty={setSelectedPropertyId}
              onViewportChange={setViewportBounds}
            />
          </section>

          <section className="min-w-0 space-y-5">
            <PropertyFilters
              propertyTypes={initialData.propertyTypes}
              transactionTypes={initialData.transactionTypes}
              sizeRange={initialData.sizeRange}
              value={filters}
              onChange={setFilters}
              onReset={() => {
                setFilters(createDefaultFilters(initialData));
                setSearchQuery("");
                setSelectedLocation(null);
              }}
            />

            <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {visibleProperties.length} properties available
                </p>
                <p className="text-sm text-slate-500">
                  Showing page {visibleProperties.length ? currentPage : 0} of{" "}
                  {visibleProperties.length ? totalPages : 0}
                </p>
              </div>
              {/* <p className="text-sm text-slate-500">
                Source total: {initialData.total} listing{initialData.total === 1 ? "" : "s"}
              </p> */}
            </div>

            <PropertyResultsList
              properties={paginatedProperties}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={setSelectedPropertyId}
            />

            <PropertyPagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          </section>
        </div>
      </div>
    </div>
  );
}
