import { Segment } from "./segment";
import {
  ArgTypes,
  PublicMethods,
  RelativeFrom,
  SearchParamsInput,
} from "./types";

export const toSearchParams = (input?: SearchParamsInput): string => {
  if (input === undefined) return "";
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(input)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      for (const v of value) {
        params.append(key, String(v));
      }
    } else {
      params.append(key, value.toString());
    }
  }
  return `?${params.toString()}`;
};

export const getPublicApiMethods = (segment: Segment): PublicMethods => ({
  toString: () => segment.path(),
  path: (params?: SearchParamsInput) => segment.path(params),
  segment: () => segment.segmentOnly(),
  segments: () => segment.segments(),
  relativeFrom: (prevLocation: RelativeFrom) =>
    segment.relativeFrom(prevLocation),
});

export const checkArgType = (t: ArgTypes, value: any) => {
  switch (t) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "bigint":
      return typeof value === "bigint";
    case "symbol":
      return typeof value === "symbol";
    default:
      return false;
  }
};
