// router.ts
type ArgTypes = "string" | "number" | "boolean" | "bigint" | "symbol";

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

type SearchParamsInput = Record<
  string,
  string | number | boolean | string[] | number[] | boolean[] | undefined | null
>;

type PathOptions = {
  params?: SearchParamsInput;
};

const toSearchParams = (input?: SearchParamsInput): string => {
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

type PublicMethods = {
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

type RelativeTo = string | { path: () => string };

class Segment {
  constructor(
    private readonly segment: string | null,
    private readonly parent: Segment | null
  ) {}

  path(options?: PathOptions): string {
    const segments = this.segments();
    const full = `/${segments.join("/")}${toSearchParams(options?.params)}`;
    return full.replace(/\/+/, "/");
  }

  segmentOnly(): string {
    return this.segment ?? "/";
  }

  segments(): string[] {
    const segments: string[] = [this.segmentOnly()];
    let parent = this.parent;
    while (parent !== null) {
      segments.unshift(parent.segmentOnly());
      parent = parent.parent;
    }
    return segments;
  }

  relativeTo(location: RelativeTo): string {
    const fromParts = this.segments();
    if (typeof location === "object") {
      location = location.path();
    }
    const toParts = location.replace(/\/+/, "/").split("/").filter(Boolean);

    let i = 0;
    while (
      i < fromParts.length &&
      i < toParts.length &&
      fromParts[i] === toParts[i]
    ) {
      i++;
    }

    const down = toParts.length - i;
    const up = fromParts.slice(i);

    return `${new Array(down).fill("..").join("/")}${
      down && up.length ? "/" : ""
    }${up.join("/")}`;
  }
}

/* ===== Build router recursively ===== */

export const buildRoutes = <T extends Def>(
  def: T,
  parent: Segment | null = null
): RouterAPI<T> => {
  const api: any = {};

  for (const key of Object.keys(def)) {
    const children = def[key as keyof Def] as Def;

    const isArg =
      children &&
      typeof children === "object" &&
      Object.hasOwn(children, "__argType");

    if (isArg) {
      const { __argType, ...rest } = children;

      api[key] = function (value?: any) {
        const v = arguments.length === 0 ? `:${key}` : value; // ← use :keyName if no argument
        // runtime type checking only if a real value is provided
        if (
          __argType &&
          value !== undefined &&
          arguments.length > 0 &&
          !checkArgType(__argType, value)
        ) {
          throw new TypeError(
            `Invalid type for segment "${key}". Expected ${__argType}, got ${typeof value}`
          );
        }

        const childSegment = new Segment(String(v), parent);
        return Object.keys(rest).length > 0
          ? buildRoutes(rest, childSegment)
          : getPublicApiMethods(childSegment);
      };
    } else {
      const childSegment = new Segment(key, parent);
      const hasChildren =
        children &&
        typeof children === "object" &&
        Object.keys(children).length > 0;
      api[key] = hasChildren
        ? buildRoutes(children, childSegment)
        : getPublicApiMethods(childSegment);
    }
  }

  const segmentForApi = parent ?? new Segment(null, null);
  Object.assign(api, getPublicApiMethods(segmentForApi));
  return api as RouterAPI<T>;
};

const getPublicApiMethods = (segment: Segment): PublicMethods => ({
  toString: () => segment.path(),
  path: (params?: SearchParamsInput) => segment.path(params),
  segment: () => segment.segmentOnly(),
  segments: () => segment.segments(),
  relativeTo: (location: RelativeTo) => segment.relativeTo(location),
});

/* ===== Runtime type check ===== */

const checkArgType = (t: ArgTypes, value: any) => {
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

/* ===== Example usage ===== */

export const root = buildRoutes({
  settings: {},
  projects: {
    projectId: {
      __argType: "string",
      configuration: {},
      enhancers: {},
      changelog: {},
      files: {},
      fragments: {
        generation: {},
        fragmentAnalysisId: { __argType: "string" },
        library: {
          detail: {
            genomicLocationId: {
              __argType: "string",
              fragmentId: {
                __argType: "string",
              },
            },
          },
        },
        reports: {},
        experiments: {
          detail: {
            experimentId: {
              __argType: "string",
            },
          },
        },
      },
      analyses: {},
    },
    sses: {
      generation: {},
      explorer: {
        sseGenerationRequestId: {
          __argType: "string",
        },
      },
      library: {
        detail: {
          sseId: { __argType: "string" },
        },
      },
    },
  },
  genomes: { genomeId: { __argType: "string" } },
});

/* ===== Usage examples ===== */

console.log(root.genomes.genomeId().path());
