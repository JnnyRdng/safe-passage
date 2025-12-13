export type HiddenUtilKeys = "__argType" | "__search";

/** The allowable arg types for a route parameter */
export type ArgTypes = "string" | "number" | "boolean" | "bigint" | "symbol";

type LeafNode = {
  __argType?: ArgTypes;
  __search?: Params;
};

export type ParamType =
  | string
  | number
  | boolean
  | string[]
  | number[]
  | boolean[]
  | undefined
  | null;

export type ParamLiteral =
  | "string"
  | "number"
  | "boolean"
  | "string[]"
  | "number[]"
  | "boolean[]";

interface Params {
  [key: string]: Param;
}

interface Param {
  type: ParamLiteral;
}

type RouteNode = {
  __argType?: ArgTypes;
  __search?: Params;
} & {
  [K in Exclude<string, HiddenUtilKeys>]?: RouteDefinition;
};

/** A route definition */
export type RouteDefinition = LeafNode | RouteNode;
