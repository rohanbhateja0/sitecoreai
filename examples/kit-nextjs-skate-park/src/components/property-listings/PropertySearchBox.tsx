"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import type { PropertySearchLocation } from "./types";

interface SuggestionItem {
  placeId: string;
  description: string;
}

interface PropertySearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onLocationSelect: (location: PropertySearchLocation | null) => void;
}

export function PropertySearchBox({
  value,
  onChange,
  onLocationSelect,
}: PropertySearchBoxProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded } = useGoogleMaps(apiKey);
  const containerRef = useRef<HTMLDivElement>(null);
  const autocompleteServiceRef = useRef<any>(null);
  const geocoderRef = useRef<any>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isResolvingLocation, setIsResolvingLocation] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionItem[]>([]);

  useEffect(() => {
    const googleMaps = window.google as any;

    if (!isLoaded || !googleMaps?.maps?.places) {
      return;
    }

    if (!autocompleteServiceRef.current) {
      autocompleteServiceRef.current = new googleMaps.maps.places.AutocompleteService();
    }

    if (!geocoderRef.current) {
      geocoderRef.current = new googleMaps.maps.Geocoder();
    }
  }, [isLoaded]);

  useEffect(() => {
    if (!isLoaded || !autocompleteServiceRef.current || value.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timeout = window.setTimeout(() => {
      const googleMaps = window.google as any;

      autocompleteServiceRef.current.getPlacePredictions(
        { input: value },
        (predictions: any[] | null, status: string) => {
          if (status !== googleMaps.maps.places.PlacesServiceStatus.OK || !predictions) {
            setSuggestions([]);
            return;
          }

          setSuggestions(
            predictions.slice(0, 5).map((prediction) => ({
              placeId: prediction.place_id,
              description: prediction.description,
            }))
          );
        }
      );
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [isLoaded, value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectSuggestion = (suggestion: SuggestionItem) => {
    onChange(suggestion.description);
    setSuggestions([]);
    setIsFocused(false);

    if (!geocoderRef.current) {
      return;
    }

    setIsResolvingLocation(true);

    geocoderRef.current.geocode({ placeId: suggestion.placeId }, (results: any[] | null, status: string) => {
      setIsResolvingLocation(false);

      if (status !== "OK" || !results?.[0]?.geometry?.location) {
        return;
      }

      const geometry = results[0].geometry;
      const viewport = geometry.viewport;

      onLocationSelect({
        label: suggestion.description,
        center: {
          lat: geometry.location.lat(),
          lng: geometry.location.lng(),
        },
        bounds: viewport
          ? {
              north: viewport.getNorthEast().lat(),
              south: viewport.getSouthWest().lat(),
              east: viewport.getNorthEast().lng(),
              west: viewport.getSouthWest().lng(),
            }
          : undefined,
      });
    });
  };

  return (
    <div className="relative" ref={containerRef}>
      <label htmlFor="property-search" className="mb-2 block text-sm font-medium text-slate-700">
        Search
      </label>

      <div className="relative">
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor">
            <path
              d="M21 21l-4.35-4.35m1.85-5.15a7 7 0 11-14 0 7 7 0 0114 0z"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </span>

        <input
          id="property-search"
          type="text"
          value={value}
          onChange={(event) => {
            const nextValue = event.target.value;
            onChange(nextValue);

            if (!nextValue.trim()) {
              onLocationSelect(null);
            }
          }}
          onFocus={() => setIsFocused(true)}
          placeholder="Search by place, city, postcode, or property"
          className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-12 pr-12 text-sm text-slate-900 shadow-sm outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100"
        />

        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onLocationSelect(null);
              setSuggestions([]);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700"
            aria-label="Clear search"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor">
              <path
                d="M6 6l12 12M18 6L6 18"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        ) : null}
      </div>

      {isFocused && suggestions.length > 0 ? (
        <div className="absolute z-20 mt-1 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-lg">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion.placeId}
              onClick={() => handleSelectSuggestion(suggestion)}
              className="block w-full border-b border-slate-100 px-4 py-3 text-left text-sm text-slate-700 transition last:border-b-0 hover:bg-slate-50"
            >
              {suggestion.description}
            </button>
          ))}
        </div>
      ) : null}

      <p className="mt-2 text-xs text-slate-500">
        {apiKey
          ? isResolvingLocation
            ? "Updating the map to your selected location..."
            : "Google Places autosuggest is enabled."
          : "Set NEXT_PUBLIC_GOOGLE_MAPS_API_KEY to enable autosuggest and the live map."}
      </p>
    </div>
  );
}
