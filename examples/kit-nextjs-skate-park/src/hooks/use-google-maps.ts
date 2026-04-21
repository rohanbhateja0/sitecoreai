"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from "react";

let isGoogleMapsLoaded = false;
let isGoogleMapsLoading = false;
const loadingCallbacks: Array<() => void> = [];

declare global {
  interface Window {
    google: any;
    initGoogleMapsCallback: () => void;
  }
}

function hasGoogleMapsApi() {
  return Boolean(
    window.google?.maps?.Map &&
      window.google?.maps?.Marker &&
      window.google?.maps?.Size &&
      window.google?.maps?.Point &&
      window.google?.maps?.places
  );
}

function injectGoogleMapsScript(
  apiKey: string,
  onLoad: () => void,
  onError: (error: Error) => void
) {
  if (isGoogleMapsLoaded || hasGoogleMapsApi()) {
    isGoogleMapsLoaded = true;
    onLoad();
    return;
  }

  if (isGoogleMapsLoading) {
    loadingCallbacks.push(onLoad);
    return;
  }

  isGoogleMapsLoading = true;

  const script = document.createElement("script");
  script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places&callback=initGoogleMapsCallback`;
  script.async = true;
  script.defer = true;

  window.initGoogleMapsCallback = () => {
    isGoogleMapsLoaded = true;
    isGoogleMapsLoading = false;
    onLoad();
    loadingCallbacks.forEach((callback) => callback());
    loadingCallbacks.length = 0;
  };

  script.onerror = () => {
    isGoogleMapsLoading = false;
    onError(new Error("Failed to load Google Maps API"));
  };

  document.head.appendChild(script);
}

export function useGoogleMaps(apiKey: string) {
  const [isLoaded, setIsLoaded] = useState(isGoogleMapsLoaded);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!apiKey) {
      setError(new Error("Google Maps API key is not configured"));
      return;
    }

    if (isGoogleMapsLoaded || hasGoogleMapsApi()) {
      isGoogleMapsLoaded = true;
      setIsLoaded(true);
      return;
    }

    if (isGoogleMapsLoading) {
      const callback = () => setIsLoaded(true);
      loadingCallbacks.push(callback);

      return () => {
        const callbackIndex = loadingCallbacks.indexOf(callback);
        if (callbackIndex >= 0) {
          loadingCallbacks.splice(callbackIndex, 1);
        }
      };
    }

    let cancelled = false;

    const schedule =
      typeof window.requestIdleCallback === "function"
        ? (callback: () => void) => window.requestIdleCallback(callback, { timeout: 4000 })
        : (callback: () => void) => window.setTimeout(callback, 2500);

    const handle = schedule(() => {
      if (cancelled) {
        return;
      }

      injectGoogleMapsScript(
        apiKey,
        () => setIsLoaded(true),
        (nextError) => setError(nextError)
      );
    });

    return () => {
      cancelled = true;

      if (typeof window.cancelIdleCallback === "function" && typeof handle === "number") {
        window.cancelIdleCallback(handle);
      } else {
        clearTimeout(handle as unknown as ReturnType<typeof setTimeout>);
      }

      window.initGoogleMapsCallback = () => {};
    };
  }, [apiKey]);

  return { isLoaded, error };
}
