import { buildRoutes } from "./builder";
import { RouteDefinition } from "./types/route-definition";

export const defineRoute = <const T extends RouteDefinition>(
  routeDefinition: T
) => buildRoutes(routeDefinition);

export type { PathOptions, SearchParamsInput } from "./types/api-definition";
export type { ArgTypes } from "./types/route-definition";

const root = defineRoute({
  __search: {
    food: {
      type: "string[]",
    },
  },
  foo: {},
});

console.log(root.path({ params: { food: "yes" } }));
