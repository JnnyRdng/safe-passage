import { HiddenUtilKeys, ParamType } from "./route-definition";
import { RelativeFrom } from "./types";

// Strip __argType for child type inference
type Clean<T> = {
  [K in keyof T as K extends HiddenUtilKeys ? never : K]: T[K];
};

// Map Types to actual TS types
type TypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
  symbol: symbol;
};

/** URL Search Params definition */
export type SearchParamsInput = Record<string, ParamType>;

/** Options for printing a path to a string */
export type PathOptions = {
  params?: SearchParamsInput;
};

/** Public methods exposed to each segment in a route */
export type PublicMethods = {
  /**Print the absolute path.  */
  path(options?: PathOptions): string;
  toString: () => string;
  /** Return the segment name */
  segment(): string;
  /** Return the path as an array of segments */
  segments(): string[];
  /** Get the relative path from the `prevLocation` */
  relativeFrom(prevLocation: RelativeFrom): string;
};

/** A traversable, callable tree of route segments */
export type RouterAPI<T> = PublicMethods & {
  [K in keyof T as K extends HiddenUtilKeys ? never : K]: T[K] extends {
    __argType: infer A;
  }
    ? (
        value?: A extends keyof TypeMap ? TypeMap[A] : never
      ) => RouterAPI<Clean<T[K]>>
    : RouterAPI<Clean<T[K]>>;
};
