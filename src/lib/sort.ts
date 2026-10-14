import type { Manifest } from "../types";

export type SortField = "name" | "updatedAt" | "vendor" | "cert";
export type SortDirection = "asc" | "desc";
export type SortOption =
  | "name-asc"
  | "name-desc"
  | "cert-asc"
  | "cert-desc"
  | "updatedAt-desc"
  | "updatedAt-asc"
  | "vendor-asc"
  | "vendor-desc";

export function parseSortOption(option: string): {
  field: SortField;
  direction: SortDirection;
} {
  switch (option) {
    case "name-desc":
      return { field: "name", direction: "desc" };
    case "cert-desc":
      return { field: "cert", direction: "desc" };
    case "cert-asc":
      return { field: "cert", direction: "asc" };
    case "updatedAt-desc":
      return { field: "updatedAt", direction: "desc" };
    case "updatedAt-asc":
      return { field: "updatedAt", direction: "asc" };
    case "vendor-desc":
      return { field: "vendor", direction: "desc" };
    case "vendor-asc":
      return { field: "vendor", direction: "asc" };
    case "name-asc":
    default:
      return { field: "name", direction: "asc" };
  }
}

export function toSortOption(
  field: SortField,
  direction: SortDirection,
): SortOption {
  if (field === "name") {
    return direction === "asc" ? "name-asc" : "name-desc";
  }
  if (field === "cert") {
    return direction === "asc" ? "cert-asc" : "cert-desc";
  }
  if (field === "vendor") {
    return direction === "asc" ? "vendor-asc" : "vendor-desc";
  }
  return direction === "asc" ? "updatedAt-asc" : "updatedAt-desc";
}

export function sortManifests(
  manifests: readonly Manifest[],
  field: SortField,
  direction: SortDirection,
): Manifest[] {
  const multiplier = direction === "asc" ? 1 : -1;

  return [...manifests].sort((a, b) => {
    let comparison = 0;
    if (field === "name") {
      comparison =
        a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        }) * multiplier;
    } else if (field === "cert") {
      comparison = a.cert.localeCompare(b.cert) * multiplier;
    } else if (field === "vendor") {
      comparison =
        a.vendor.localeCompare(b.vendor, undefined, {
          sensitivity: "base",
        }) * multiplier;
      if (comparison === 0) {
        // Within the same vendor, always sort by name ascending (A–Z)
        comparison = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
      }
    } else if (field === "updatedAt") {
      comparison = a.updatedAt.localeCompare(b.updatedAt) * multiplier;
      if (comparison === 0) {
        // Same date tie-breaker: sort by name ascending (A–Z)
        comparison = a.name.localeCompare(b.name, undefined, {
          sensitivity: "base",
        });
      }
    }
    // Stable deterministic tie-breaker on cert slug (always ascending)
    if (comparison === 0) {
      comparison = a.cert.localeCompare(b.cert);
    }
    return comparison;
  });
}
