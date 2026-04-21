"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PropertyFilters } from "./PropertyFilters";
import { PropertyMap } from "./PropertyMap";
import { PropertyPagination } from "./PropertyPagination";
import { PropertyResultsList } from "./PropertyResultsList";
import { PropertyListingsIdentityForm } from "./PropertyListingsIdentityForm";
import { PropertySearchBox, type PropertyTrackedSearchPayload } from "./PropertySearchBox";
import {
  trackPropertyCardClicked,
  trackPropertyFilterChanged,
  trackPropertySearch,
  trackPropertySortChanged,
} from "@/lib/engage/property-listings-engage-events";
import type {
  PropertyListing,
  PropertyListingsFilters,
  PropertyMapViewportBounds,
  PropertyListingsPageProps,
  PropertySearchLocation,
} from "./types";

const PAGE_SIZE = 6;
const EARTH_RADIUS_KM = 6371;

export type PropertyListingSortOption =
  | "relevance"
  | "title_asc"
  | "title_desc"
  | "size_asc"
  | "size_desc";

function sortPropertyListings(
  list: PropertyListing[],
  sort: PropertyListingSortOption
): PropertyListing[] {
  const copy = [...list];
  const sizeRank = (p: PropertyListing) => p.minSizeValue ?? p.totalSizeValue ?? 0;

  switch (sort) {
    case "title_asc":
      return copy.sort((a, b) => a.addressLabel.localeCompare(b.addressLabel));
    case "title_desc":
      return copy.sort((a, b) => b.addressLabel.localeCompare(a.addressLabel));
    case "size_asc":
      return copy.sort((a, b) => sizeRank(a) - sizeRank(b));
    case "size_desc":
      return copy.sort((a, b) => sizeRank(b) - sizeRank(a));
    default:
      return copy;
  }
}

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
  const [sortBy, setSortBy] = useState<PropertyListingSortOption>("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPropertyId, setSelectedPropertyId] = useState<string | null>(
    initialData.listings[0]?.id || null
  );

  const countsRef = useRef({
    filtered: 0,
    visible: 0,
    total: initialData.listings.length,
  });

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

  const sortedVisibleProperties = useMemo(
    () => sortPropertyListings(visibleProperties, sortBy),
    [visibleProperties, sortBy]
  );

  useEffect(() => {
    countsRef.current = {
      filtered: filteredProperties.length,
      visible: sortedVisibleProperties.length,
      total: initialData.listings.length,
    };
  }, [filteredProperties.length, sortedVisibleProperties.length, initialData.listings.length]);

  const totalPages = Math.max(1, Math.ceil(sortedVisibleProperties.length / PAGE_SIZE));

  const paginatedProperties = useMemo(() => {
    const startIndex = (currentPage - 1) * PAGE_SIZE;
    return sortedVisibleProperties.slice(startIndex, startIndex + PAGE_SIZE);
  }, [currentPage, sortedVisibleProperties]);

  const handlePropertySearchTracked = useCallback(
    (payload: PropertyTrackedSearchPayload) => {
      window.setTimeout(() => {
        const { filtered, visible, total } = countsRef.current;
        if (payload.kind === "location") {
          void trackPropertySearch(locale, {
            search_mode: "location",
            place_id: payload.placeId,
            location_label: payload.locationLabel,
            center_lat: payload.centerLat,
            center_lng: payload.centerLng,
            has_bounds: payload.hasBounds,
            filtered_listing_count: filtered,
            visible_listing_count: visible,
            total_source_listings: total,
          });
        } else {
          void trackPropertySearch(locale, {
            search_mode: "text",
            query: payload.query,
            filtered_listing_count: filtered,
            visible_listing_count: visible,
            total_source_listings: total,
          });
        }
      }, 0);
    },
    [locale]
  );

  const handleSelectProperty = useCallback(
    (propertyId: string, clickSource: "results_list" | "map_marker") => {
      const property = filteredProperties.find((p) => p.id === propertyId);
      if (property) {
        const listIndex = paginatedProperties.findIndex((p) => p.id === propertyId);
        void trackPropertyCardClicked(locale, {
          property_id: property.id,
          property_title: property.title,
          property_type: property.propertyType,
          property_sub_type: property.propertySubType,
          transaction_type: property.transactionType,
          city: property.city,
          region: property.region,
          country: property.country,
          address_label: property.addressLabel,
          click_source: clickSource,
          list_index: listIndex,
          current_page: currentPage,
          page_size: PAGE_SIZE,
        });
      }
      setSelectedPropertyId(propertyId);
    },
    [filteredProperties, paginatedProperties, currentPage, locale]
  );

  const skipFilterEngage = useRef(true);
  useEffect(() => {
    if (skipFilterEngage.current) {
      skipFilterEngage.current = false;
      return;
    }
    const handle = window.setTimeout(() => {
      const { filtered, visible, total } = countsRef.current;
      void trackPropertyFilterChanged(locale, {
        property_types: filters.propertyTypes.length ? filters.propertyTypes.join("|") : "all",
        transaction_types: filters.transactionTypes.length
          ? filters.transactionTypes.join("|")
          : "all",
        size_min: filters.sizeRange[0],
        size_max: filters.sizeRange[1],
        size_unit: initialData.sizeRange.unit,
        filtered_listing_count: filtered,
        visible_listing_count: visible,
        total_source_listings: total,
      });
    }, 450);
    return () => window.clearTimeout(handle);
  }, [filters, locale, initialData.sizeRange.unit]);

  const sortEngageReady = useRef(false);
  const prevSort = useRef<PropertyListingSortOption>(sortBy);
  useEffect(() => {
    if (!sortEngageReady.current) {
      sortEngageReady.current = true;
      prevSort.current = sortBy;
      return;
    }
    if (prevSort.current === sortBy) {
      return;
    }
    const sortFrom = prevSort.current;
    prevSort.current = sortBy;
    void trackPropertySortChanged(locale, {
      sort_from: sortFrom,
      sort_to: sortBy,
      result_count: sortedVisibleProperties.length,
      total_source_listings: initialData.listings.length,
    });
  }, [sortBy, sortedVisibleProperties.length, locale, initialData.listings.length]);

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
    if (!sortedVisibleProperties.some((property) => property.id === selectedPropertyId)) {
      setSelectedPropertyId(sortedVisibleProperties[0]?.id || null);
    }
  }, [sortedVisibleProperties, selectedPropertyId]);

  useEffect(() => {
    setCurrentPage(1);
  }, [sortBy]);

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
              onPropertySearch={handlePropertySearchTracked}
            />

            <PropertyMap
              properties={filteredProperties}
              selectedPropertyId={selectedPropertyId}
              focusLocation={selectedLocation}
              onSelectProperty={(id) => handleSelectProperty(id, "map_marker")}
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

            <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
              <div>
                <p className="text-lg font-semibold text-slate-900">
                  {sortedVisibleProperties.length} properties available
                </p>
                <p className="text-sm text-slate-500">
                  Showing page {sortedVisibleProperties.length ? currentPage : 0} of{" "}
                  {sortedVisibleProperties.length ? totalPages : 0}
                </p>
              </div>
              <label className="flex min-w-[200px] flex-col gap-1 text-sm text-slate-700 sm:items-end">
                <span className="font-medium text-slate-600">Sort</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as PropertyListingSortOption)}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100 sm:w-56"
                  aria-label="Sort property listings"
                >
                  <option value="relevance">Relevance (default)</option>
                  <option value="title_asc">Address A–Z</option>
                  <option value="title_desc">Address Z–A</option>
                  <option value="size_asc">Size (smallest first)</option>
                  <option value="size_desc">Size (largest first)</option>
                </select>
              </label>
            </div>

            <PropertyResultsList
              properties={paginatedProperties}
              selectedPropertyId={selectedPropertyId}
              onSelectProperty={(id) => handleSelectProperty(id, "results_list")}
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
