import { Segment } from "./segment";
import { PathOptions, PublicMethods, SearchParamsInput } from "./types/api-definition";
import { ArgTypes, InferSearchParams, Param, ParamLiteral, Params } from "./types/route-definition";
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

export const getPublicApiMethods = <S extends Params | undefined = undefined>(
  segment: Segment,
  search?: S
): PublicMethods<S> => ({
  toString: () => segment.path(),
  path: (options?: PathOptions<S>) => {
    if (search && options?.params) {
      validateSearchParams(search, options.params, segment.path());
    }
    return segment.path(options);
  },
  segment: () => segment.segmentOnly(),
  segments: () => segment.segments(),
  relativeFrom: (prevLocation: RelativeFrom) =>
    segment.relativeFrom(prevLocation),
});

const checkSearchType = (type: ParamLiteral, value: unknown): boolean => {
  if (type.endsWith("[]")) {
    if (!Array.isArray(value)) return false;
    const base = type.slice(0, -2);
    return value.every(v => typeof v === base);
  }
  return typeof value === type;
};

export const validateSearchParams = (
  schema: Params,
  params: Record<string, unknown>,
  path: string
) => {
  for (const key of Object.keys(params)) {
    const value = params[key];
    const def = schema[key];

    if (!def) {
      throw new TypeError(`Unknown search parameter "${key}" for path ${path}`);
    }

    if (value === undefined) {
      if (!def.optional) {
        throw new TypeError(`Search parameter "${key}" is required for path ${path}`);
      }
      continue;
    }

    if (!checkSearchType(def.type, value)) {
      throw new TypeError(
        `Invalid type for search parameter "${key}", expected ${def.type} for path ${path}`
      );
    }
  }
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
