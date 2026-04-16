"use client";

/* eslint-disable @next/next/no-img-element */
import type { PropertyListing } from "./types";

interface PropertyResultsListProps {
  properties: PropertyListing[];
  selectedPropertyId: string | null;
  onSelectProperty: (propertyId: string) => void;
}

function truncateText(value: string, maxLength: number): string {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength).trimEnd()}...`;
}

function getAgentInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || "")
    .join("");
}

function formatListingLabel(propertyType: string, transactionType: string): string {
  return `${propertyType} For ${transactionType}`;
}

export function PropertyResultsList({
  properties,
  selectedPropertyId,
  onSelectProperty,
}: PropertyResultsListProps) {
  if (!properties.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center shadow-sm">
        <h3 className="text-lg font-semibold text-slate-900">
          No properties match these filters
        </h3>
        <p className="mt-2 text-sm text-slate-500">
          Try broadening the search term or clearing some filters.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {properties.map((property) => {
        const isSelected = property.id === selectedPropertyId;

        return (
          <article
            key={property.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectProperty(property.id)}
            onKeyDown={(event) => {
              if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                onSelectProperty(property.id);
              }
            }}
            className={`w-full min-w-0 overflow-hidden rounded-2xl border bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-700 ${
              isSelected
                ? "border-emerald-700 ring-4 ring-emerald-100"
                : "border-slate-200"
            }`}
          >
            <div className="grid min-w-0 sm:grid-cols-[minmax(220px,280px)_minmax(0,1fr)]">
              <div className="h-56 bg-slate-100 sm:h-full">
                {property.imageUrl ? (
                  <img
                    src={property.imageUrl}
                    alt={property.title}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-500">
                    Image unavailable
                  </div>
                )}
              </div>

              <div className="flex min-h-full min-w-0 flex-col p-5 sm:p-7">
                <p className="text-sm font-semibold text-slate-600">
                  {formatListingLabel(property.propertyType, property.transactionType)}
                </p>

                <h3
                  className="mt-3 min-w-0 text-[2rem] font-semibold leading-none text-emerald-900 underline decoration-emerald-200 decoration-2 underline-offset-4"
                  title={property.addressLabel}
                >
                  {property.addressLabel}
                </h3>

                <p className="mt-4 min-w-0 text-xl font-medium text-slate-700">
                  {truncateText(property.title, 40)}
                </p>

                <p className="mt-4 text-2xl font-medium text-slate-800">{property.totalSizeLabel}</p>

                {property.description ? (
                  <p className="mt-2 truncate text-sm text-slate-500" title={property.description}>
                    {property.description}
                  </p>
                ) : null}

                <div className="mt-5 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Subtype
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {property.propertySubType}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wide text-slate-500">
                      Available Range
                    </p>
                    <p className="mt-1 font-medium text-slate-900">
                      {property.minSizeLabel}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-8">
                  <div className="flex min-w-0 flex-wrap gap-3">
                    {property.agents.map((agent) => (
                      <div
                        key={agent.name}
                        className="inline-flex min-w-0 max-w-full items-center gap-3 rounded-full bg-slate-100 px-3 py-2"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-300 text-xs font-semibold text-slate-700">
                          {getAgentInitials(agent.name)}
                        </div>
                        <span className="min-w-0 truncate text-sm font-medium text-emerald-900">
                          {truncateText(agent.name, 24)}
                        </span>
                      </div>
                    ))}

                    {property.website ? (
                      <a
                        href={property.website}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-800"
                      >
                        View property
                        <span aria-hidden="true">↗</span>
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
