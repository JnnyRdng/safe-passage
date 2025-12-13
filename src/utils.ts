import { Segment } from "./segment";
import { PublicMethods, SearchParamsInput } from "./types/api-definition";
import { ArgTypes, ParamLiteral } from "./types/route-definition";
import { RelativeFrom } from "./types/types";

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

export const getPublicApiMethods = (segment: Segment): PublicMethods => {
  return {
    toString: () => segment.path(),
    path: (params?: SearchParamsInput) => segment.path(params),
    segment: () => segment.segmentOnly(),
    segments: () => segment.segments(),
    relativeFrom: (prevLocation: RelativeFrom) =>
      segment.relativeFrom(prevLocation),
  };
};

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

export const checkParamType = (t: ParamLiteral, value: any) => {
  switch (t) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "string[]":
      return Array.isArray(value) && value.every((v) => typeof v === "string");
    case "number[]":
      return Array.isArray(value) && value.every((v) => typeof v === "number");
    case "boolean[]":
      return Array.isArray(value) && value.every((v) => typeof v === "boolean");
  }
};
