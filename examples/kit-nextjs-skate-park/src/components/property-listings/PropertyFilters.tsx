"use client";

import { useEffect, useRef, useState } from "react";
import type { PropertyListingsFilters } from "./types";

interface PropertyFiltersProps {
  propertyTypes: string[];
  transactionTypes: string[];
  sizeRange: {
    min: number;
    max: number;
    unit: string;
  };
  value: PropertyListingsFilters;
  onChange: (value: PropertyListingsFilters) => void;
  onReset: () => void;
}

function toggleValue(values: string[], nextValue: string): string[] {
  if (values.includes(nextValue)) {
    return values.filter((value) => value !== nextValue);
  }

  return [...values, nextValue];
}

function formatArea(value: number, unit: string): string {
  return `${Intl.NumberFormat("en-US").format(Math.round(value))} ${unit}`;
}

function hasCustomSize(
  currentSizeRange: [number, number],
  defaultSizeRange: { min: number; max: number; unit: string }
) {
  return (
    currentSizeRange[0] !== defaultSizeRange.min || currentSizeRange[1] !== defaultSizeRange.max
  );
}

function getPropertyTypesLabel(selectedValues: string[]) {
  if (!selectedValues.length) {
    return "All Property Types";
  }

  if (selectedValues.length === 1) {
    return selectedValues[0];
  }

  return `${selectedValues.length} Property Types`;
}

function getTransactionTypesLabel(selectedValues: string[]) {
  if (!selectedValues.length) {
    return "All Transaction Types";
  }

  if (selectedValues.length === 1) {
    return selectedValues[0];
  }

  return `${selectedValues.length} Transaction Types`;
}

function getSizeLabel(
  currentSizeRange: [number, number],
  defaultSizeRange: { min: number; max: number; unit: string }
) {
  if (!hasCustomSize(currentSizeRange, defaultSizeRange)) {
    return "Size";
  }

  return `${formatArea(currentSizeRange[0], defaultSizeRange.unit)} - ${formatArea(
    currentSizeRange[1],
    defaultSizeRange.unit
  )}`;
}

export function PropertyFilters({
  propertyTypes,
  transactionTypes,
  sizeRange,
  value,
  onChange,
  onReset,
}: PropertyFiltersProps) {
  const [openMenu, setOpenMenu] = useState<"propertyTypes" | "transactionTypes" | "size" | null>(
    null
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const propertyTypesLabel = getPropertyTypesLabel(value.propertyTypes);
  const transactionTypesLabel = getTransactionTypesLabel(value.transactionTypes);
  const sizeLabel = getSizeLabel(value.sizeRange, sizeRange);

  const hasActiveFilters =
    value.propertyTypes.length > 0 ||
    value.transactionTypes.length > 0 ||
    hasCustomSize(value.sizeRange, sizeRange);

  return (
    <div className="space-y-3" ref={containerRef}>
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu(openMenu === "propertyTypes" ? null : "propertyTypes")
            }
            className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-5 py-3 text-sm font-medium text-emerald-950 shadow-sm transition hover:bg-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor">
                <path
                  d="M4 10.5l3.25 3.25L16 5"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{propertyTypesLabel}</span>
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 text-slate-400 transition ${openMenu === "propertyTypes" ? "rotate-180" : ""}`}
              fill="currentColor"
            >
              <path d="M5.5 7.5 10 12l4.5-4.5" />
            </svg>
          </button>

          {openMenu === "propertyTypes" ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="space-y-3">
                {propertyTypes.map((propertyType) => (
                  <label key={propertyType} className="flex items-center gap-3 text-sm text-slate-700">
                    <input
                      type="checkbox"
                      checked={value.propertyTypes.includes(propertyType)}
                      onChange={() =>
                        onChange({
                          ...value,
                          propertyTypes: toggleValue(value.propertyTypes, propertyType),
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>{propertyType}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() =>
              setOpenMenu(openMenu === "transactionTypes" ? null : "transactionTypes")
            }
            className="inline-flex items-center gap-3 rounded-full bg-slate-100 px-5 py-3 text-sm font-medium text-emerald-950 shadow-sm transition hover:bg-slate-200"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-700">
              <svg viewBox="0 0 20 20" className="h-4 w-4" fill="none" stroke="currentColor">
                <path
                  d="M4 10.5l3.25 3.25L16 5"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>
            <span>{transactionTypesLabel}</span>
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 text-slate-400 transition ${openMenu === "transactionTypes" ? "rotate-180" : ""}`}
              fill="currentColor"
            >
              <path d="M5.5 7.5 10 12l4.5-4.5" />
            </svg>
          </button>

          {openMenu === "transactionTypes" ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-72 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="space-y-3">
                {transactionTypes.map((transactionType) => (
                  <label
                    key={transactionType}
                    className="flex items-center gap-3 text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={value.transactionTypes.includes(transactionType)}
                      onChange={() =>
                        onChange({
                          ...value,
                          transactionTypes: toggleValue(value.transactionTypes, transactionType),
                        })
                      }
                      className="h-4 w-4 rounded border-slate-300 text-emerald-700 focus:ring-emerald-700"
                    />
                    <span>{transactionType}</span>
                  </label>
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="relative">
          <button
            type="button"
            onClick={() => setOpenMenu(openMenu === "size" ? null : "size")}
            className="inline-flex items-center gap-3 rounded-full border border-emerald-950 bg-white px-5 py-3 text-sm font-medium text-emerald-950 shadow-sm transition hover:bg-emerald-50"
          >
            <span>{sizeLabel}</span>
            <svg
              viewBox="0 0 20 20"
              className={`h-4 w-4 text-slate-400 transition ${openMenu === "size" ? "rotate-180" : ""}`}
              fill="currentColor"
            >
              <path d="M5.5 7.5 10 12l4.5-4.5" />
            </svg>
          </button>

          {openMenu === "size" ? (
            <div className="absolute left-0 top-full z-20 mt-2 w-[340px] rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Size</h3>
                <span className="text-xs text-slate-500">
                  {formatArea(value.sizeRange[0], sizeRange.unit)} to{" "}
                  {formatArea(value.sizeRange[1], sizeRange.unit)}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Minimum
                  </label>
                  <input
                    type="range"
                    min={sizeRange.min}
                    max={sizeRange.max}
                    step={50}
                    value={value.sizeRange[0]}
                    onChange={(event) => {
                      const nextMin = Number(event.target.value);
                      onChange({
                        ...value,
                        sizeRange: [Math.min(nextMin, value.sizeRange[1]), value.sizeRange[1]],
                      });
                    }}
                    className="w-full accent-emerald-700"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-slate-500">
                    Maximum
                  </label>
                  <input
                    type="range"
                    min={sizeRange.min}
                    max={sizeRange.max}
                    step={50}
                    value={value.sizeRange[1]}
                    onChange={(event) => {
                      const nextMax = Number(event.target.value);
                      onChange({
                        ...value,
                        sizeRange: [value.sizeRange[0], Math.max(nextMax, value.sizeRange[0])],
                      });
                    }}
                    className="w-full accent-emerald-700"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {hasActiveFilters ? (
        <button
          type="button"
          onClick={onReset}
          className="text-sm font-medium text-slate-500 transition hover:text-slate-800"
        >
          Reset filters
        </button>
      ) : null}
    </div>
  );
}
