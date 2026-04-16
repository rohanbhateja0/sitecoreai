"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useRef, useState } from "react";
import { useGoogleMaps } from "@/hooks/use-google-maps";
import type {
  PropertyListing,
  PropertyMapViewportBounds,
  PropertySearchLocation,
} from "./types";

interface PropertyMapProps {
  properties: PropertyListing[];
  selectedPropertyId: string | null;
  focusLocation: PropertySearchLocation | null;
  onSelectProperty: (propertyId: string) => void;
  onViewportChange: (bounds: PropertyMapViewportBounds | null) => void;
}

const DEFAULT_CENTER = { lat: 51.5072, lng: -0.1276 };

function buildMarkerIcon(isSelected: boolean) {
  const googleMaps = window.google as any;
  if (!googleMaps?.maps?.Size || !googleMaps?.maps?.Point) {
    return undefined;
  }
  const fillColor = isSelected ? "#0A66FF" : "#1D4ED8";
  const markerSize = isSelected ? 44 : 36;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36">
      <path
        fill="${fillColor}"
        stroke="#FFFFFF"
        stroke-width="1.5"
        d="M18 2.75c-6.213 0-11.25 5.037-11.25 11.25 0 8.896 11.25 19.25 11.25 19.25S29.25 22.896 29.25 14C29.25 7.787 24.213 2.75 18 2.75Z"
      />
      <circle cx="18" cy="14" r="5.1" fill="#FFFFFF" />
      <circle cx="18" cy="14" r="2.2" fill="${fillColor}" />
    </svg>
  `;

  return {
    url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`,
    scaledSize: new googleMaps.maps.Size(markerSize, markerSize),
    anchor: new googleMaps.maps.Point(markerSize / 2, markerSize - 2),
  };
}

export function PropertyMap({
  properties,
  selectedPropertyId,
  focusLocation,
  onSelectProperty,
  onViewportChange,
}: PropertyMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  const { isLoaded, error } = useGoogleMaps(apiKey);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<any[]>([]);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    const googleMaps = window.google as any;

    if (
      !isLoaded ||
      !mapContainerRef.current ||
      map ||
      !googleMaps?.maps?.Map
    ) {
      return;
    }

    const nextMap = new googleMaps.maps.Map(mapContainerRef.current, {
      center: DEFAULT_CENTER,
      zoom: 5,
      disableDefaultUI: true,
      gestureHandling: "greedy",
      scrollwheel: true,
      zoomControl: true,
      fullscreenControl: true,
      streetViewControl: false,
      mapTypeControl: false,
    });

    setMap(nextMap);
  }, [isLoaded, map]);

  useEffect(() => {
    const googleMaps = window.google as any;

    if (!map || !googleMaps?.maps?.event) {
      return;
    }

    const idleListener = map.addListener("idle", () => {
      const bounds = map.getBounds?.();

      if (!bounds) {
        onViewportChange(null);
        return;
      }

      const northEast = bounds.getNorthEast();
      const southWest = bounds.getSouthWest();

      onViewportChange({
        north: northEast.lat(),
        south: southWest.lat(),
        east: northEast.lng(),
        west: southWest.lng(),
      });
    });

    return () => {
      googleMaps.maps.event.removeListener(idleListener);
    };
  }, [map, onViewportChange]);

  useEffect(() => {
    const googleMaps = window.google as any;

    if (!map || !googleMaps?.maps?.Marker) {
      return;
    }

    markersRef.current.forEach((marker) => marker.setMap(null));

    const nextMarkers = properties.map((property) => {
      const marker = new googleMaps.maps.Marker({
        position: {
          lat: property.latitude,
          lng: property.longitude,
        },
        map,
        title:
          typeof property.title === "string"
            ? property.title
            : String(property.title ?? ""),
        icon: buildMarkerIcon(property.id === selectedPropertyId),
      });

      marker.addListener("click", () => onSelectProperty(property.id));
      return marker;
    });

    markersRef.current = nextMarkers;

    return () => {
      nextMarkers.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [map, onSelectProperty, properties, selectedPropertyId]);

  useEffect(() => {
    const googleMaps = window.google as any;

    if (!map || !googleMaps?.maps?.LatLngBounds) {
      return;
    }

    if (focusLocation?.bounds) {
      map.fitBounds(focusLocation.bounds);
      return;
    }

    if (!properties.length) {
      map.setCenter(DEFAULT_CENTER);
      map.setZoom(4);
      return;
    }

    const bounds = new googleMaps.maps.LatLngBounds();
    properties.forEach((property) => {
      bounds.extend({ lat: property.latitude, lng: property.longitude });
    });
    map.fitBounds(bounds);
  }, [focusLocation, map, properties]);

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="relative h-[560px] bg-slate-100">
        <div ref={mapContainerRef} className="h-full w-full" />

        {!isLoaded && !error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/80 text-sm font-medium text-slate-700">
            Loading Google map...
          </div>
        ) : null}

        {error ? (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-100/90 px-6 text-center text-sm text-slate-700">
            Google Maps could not be loaded. Add
            `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to enable the map and autosuggest.
          </div>
        ) : null}
      </div>
    </div>
  );
}
