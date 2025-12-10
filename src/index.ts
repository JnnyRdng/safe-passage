import { Segment } from "./_segment";
import { RouteDefinition, RouterAPI } from "./_types";
import { checkArgType, getPublicApiMethods } from "./_utils";

export const buildRoutes = <T extends RouteDefinition>(
  def: T,
  parent: Segment | null = null
): RouterAPI<T> => {
  const api: any = {};

  for (const key of Object.keys(def)) {
    const children = def[key as keyof RouteDefinition] as RouteDefinition;

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
