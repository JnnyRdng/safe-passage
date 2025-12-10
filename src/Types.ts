// router.ts
export type ArgTypes = "string" | "number" | "boolean" | "bigint" | "symbol";

// Route DSL
type Leaf = {
  __argType?: ArgTypes;
};

type RouteNode = {
  __argType?: ArgTypes;
} & {
  [K in Exclude<string, "__argType">]?: Def;
};

export type Def = Leaf | RouteNode;

/* ===== Type-safe RouterAPI ===== */

// Strip __argType for child type inference
type Clean<T> = {
  [K in keyof T as K extends "__argType" ? never : K]: T[K];
};

// Map Types to actual TS types
type TypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  bigint: bigint;
  symbol: symbol;
};

export type SearchParamsInput = Record<
  string,
  string | number | boolean | string[] | number[] | boolean[] | undefined | null
>;

export type PathOptions = {
  params?: SearchParamsInput;
};

export type PublicMethods = {
  path(options?: PathOptions): string;
  toString: () => string;
  segment(): string;
  segments(): string[];
  relativeTo(location: RelativeTo): string;
};


// Router output type
export type RouterAPI<T> = PublicMethods & {
  [K in keyof T as K extends "__argType" ? never : K]: T[K] extends {
    __argType: infer A;
  }
    ? (
        value?: A extends keyof TypeMap ? TypeMap[A] : never
      ) => RouterAPI<Clean<T[K]>>
    : RouterAPI<Clean<T[K]>>;
};

/* ===== Runtime node ===== */

export type RelativeTo = string | { path: () => string };
