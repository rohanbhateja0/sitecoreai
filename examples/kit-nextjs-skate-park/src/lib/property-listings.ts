const PROPERTY_LISTINGS_ENDPOINT =
  "https://search.cbre.com/api/propertylistings/query?Site=us-im&PageSize=60";

type SizeEntry = {
  "Common.Size"?: number;
  "Common.Units"?: string;
};

type TitleEntry = {
  "Common.Text"?: string;
};

type TextValue = string | TitleEntry[];

type AddressEntry = {
  "Common.Line1"?: string;
  "Common.Line2"?: string;
  "Common.Line3"?: string;
  "Common.Locallity"?: string;
  "Common.Region"?: string;
  "Common.Country"?: string;
  "Common.PostCode"?: string;
};

type ImageResourceEntry = {
  "Common.Breakpoint"?: string;
  "Source.Uri"?: string;
};

type ImageEntry = {
  "Common.ImageResources"?: ImageResourceEntry[];
};

type AgentEntry = {
  "Common.AgentName"?: string;
  "Common.EmailAddress"?: string;
  "Common.TelephoneNumber"?: string;
};

type RawPropertyDocument = {
  "Common.PrimaryKey"?: string;
  "Common.Strapline"?: TitleEntry[];
  "Common.LocationDescription"?: TextValue;
  "Common.LongDescription"?: TextValue;
  "Common.UsageType"?: string;
  "Common.PropertySubType"?: string;
  "Common.Aspects"?: string[];
  "Common.MinimumSize"?: SizeEntry[];
  "Common.TotalSize"?: SizeEntry[];
  "Common.ActualAddress"?: AddressEntry;
  "Common.Coordinate"?: {
    lat?: number;
    lon?: number;
  };
  "Common.Agents"?: AgentEntry[];
  "Dynamic.PrimaryImage"?: ImageEntry;
  "Common.Website"?: string;
};

type RawPropertyListingsResponse = {
  DocumentCount?: number;
  Documents?: RawPropertyDocument[][];
};

export interface PropertyListing {
  id: string;
  title: string;
  description: string;
  propertyType: string;
  propertySubType: string;
  transactionType: string;
  minSizeValue: number | null;
  totalSizeValue: number | null;
  minSizeLabel: string;
  totalSizeLabel: string;
  addressLabel: string;
  city: string;
  region: string;
  country: string;
  postCode: string;
  latitude: number;
  longitude: number;
  imageUrl: string;
  website: string;
  agents: Array<{
    name: string;
    email: string;
    phone: string;
  }>;
}

export interface PropertyListingsResponse {
  total: number;
  listings: PropertyListing[];
  propertyTypes: string[];
  transactionTypes: string[];
  sizeRange: {
    min: number;
    max: number;
    unit: string;
  };
}

function getTitle(entries?: TitleEntry[]): string {
  return entries?.find((entry) => entry["Common.Text"])?.["Common.Text"]?.trim() || "";
}

function getTextValue(value?: TextValue): string {
  if (typeof value === "string") {
    return value.trim();
  }

  if (Array.isArray(value)) {
    return value.find((entry) => entry["Common.Text"])?.["Common.Text"]?.trim() || "";
  }

  return "";
}

function getFirstSize(entries?: SizeEntry[]): SizeEntry | null {
  if (!entries?.length) {
    return null;
  }

  return entries[0];
}

function formatSize(entries?: SizeEntry[]): string {
  const firstSize = getFirstSize(entries);

  if (typeof firstSize?.["Common.Size"] !== "number") {
    return "Size on request";
  }

  return `${Intl.NumberFormat("en-US").format(firstSize["Common.Size"])} ${
    firstSize["Common.Units"] || "sqft"
  }`;
}

function toSquareFeet(size?: number, units?: string): number | null {
  if (typeof size !== "number" || Number.isNaN(size)) {
    return null;
  }

  const normalizedUnits = units?.toLowerCase();

  if (normalizedUnits === "acre" || normalizedUnits === "acres") {
    return size * 43560;
  }

  return size;
}

function formatTransactionType(aspects?: string[]): string {
  const aspect = aspects?.[0];

  if (!aspect) {
    return "Available";
  }

  return aspect
    .replace(/^is/, "")
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .trim();
}

function buildAddressLabel(address?: AddressEntry): string {
  if (!address) {
    return "Address unavailable";
  }

  return [
    address["Common.Line1"],
    address["Common.Line2"],
    address["Common.Line3"],
    address["Common.Locallity"],
    address["Common.Region"],
    address["Common.PostCode"],
    address["Common.Country"],
  ]
    .map((value) => value?.trim())
    .filter((value): value is string => Boolean(value))
    .join(", ");
}

function getImageUrl(image?: ImageEntry): string {
  const resources = image?.["Common.ImageResources"] || [];

  const preferredResource =
    resources.find((resource) => resource["Common.Breakpoint"] === "large") ||
    resources.find((resource) => resource["Common.Breakpoint"] === "medium") ||
    resources.find((resource) => resource["Common.Breakpoint"] === "small") ||
    resources[0];

  return preferredResource?.["Source.Uri"] || "";
}

function getAgents(agents?: AgentEntry[]) {
  return (agents || [])
    .map((agent) => ({
      name: agent["Common.AgentName"]?.trim() || "",
      email: agent["Common.EmailAddress"]?.trim() || "",
      phone: agent["Common.TelephoneNumber"]?.trim() || "",
    }))
    .filter((agent) => agent.name);
}

function normalizeProperty(document: RawPropertyDocument, index: number): PropertyListing | null {
  const coordinates = document["Common.Coordinate"];

  if (typeof coordinates?.lat !== "number" || typeof coordinates?.lon !== "number") {
    return null;
  }

  const address = document["Common.ActualAddress"];
  const minSize = getFirstSize(document["Common.MinimumSize"]);
  const totalSize = getFirstSize(document["Common.TotalSize"]);
  const title =
    getTitle(document["Common.Strapline"]) ||
    getTextValue(document["Common.LocationDescription"]) ||
    address?.["Common.Line1"] ||
    `Property ${index + 1}`;

  return {
    id: document["Common.PrimaryKey"] || `${title}-${index}`,
    title,
    description:
      getTextValue(document["Common.LongDescription"]) ||
      getTextValue(document["Common.LocationDescription"]) ||
      "",
    propertyType: document["Common.UsageType"] || "Property",
    propertySubType: document["Common.PropertySubType"] || document["Common.UsageType"] || "General",
    transactionType: formatTransactionType(document["Common.Aspects"]),
    minSizeValue: toSquareFeet(minSize?.["Common.Size"], minSize?.["Common.Units"]),
    totalSizeValue: toSquareFeet(totalSize?.["Common.Size"], totalSize?.["Common.Units"]),
    minSizeLabel: formatSize(document["Common.MinimumSize"]),
    totalSizeLabel: formatSize(document["Common.TotalSize"]),
    addressLabel: buildAddressLabel(address),
    city: address?.["Common.Locallity"] || "",
    region: address?.["Common.Region"] || "",
    country: address?.["Common.Country"] || "",
    postCode: address?.["Common.PostCode"] || "",
    latitude: coordinates.lat,
    longitude: coordinates.lon,
    imageUrl: getImageUrl(document["Dynamic.PrimaryImage"]),
    website: document["Common.Website"] || "",
    agents: getAgents(document["Common.Agents"]).slice(0, 2),
  };
}

export async function getPropertyListings(): Promise<PropertyListingsResponse> {
  const response = await fetch(PROPERTY_LISTINGS_ENDPOINT, {
    next: {
      revalidate: 900,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch property listings: ${response.status}`);
  }

  const payload = (await response.json()) as RawPropertyListingsResponse;
  const listings = (payload.Documents?.flat() || [])
    .map((document, index) => normalizeProperty(document, index))
    .filter((listing): listing is PropertyListing => Boolean(listing));

  const propertyTypes = Array.from(new Set(listings.map((listing) => listing.propertyType))).sort();
  const transactionTypes = Array.from(
    new Set(listings.map((listing) => listing.transactionType))
  ).sort();
  const sizes = listings
    .flatMap((listing) => [listing.minSizeValue, listing.totalSizeValue])
    .filter((size): size is number => typeof size === "number" && size > 0);

  return {
    total: payload.DocumentCount || listings.length,
    listings,
    propertyTypes,
    transactionTypes,
    sizeRange: {
      min: sizes.length ? Math.floor(Math.min(...sizes)) : 0,
      max: sizes.length ? Math.ceil(Math.max(...sizes)) : 0,
      unit: "sqft",
    },
  };
}
