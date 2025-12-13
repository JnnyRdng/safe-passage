import { buildRoutes } from "./builder";
import { InferSearchParams, RouteDefinition } from "./types/route-definition";

export const defineRoute = <const T extends RouteDefinition>(
  routeDefinition: T
) => buildRoutes(routeDefinition);

export type { PathOptions, SearchParamsInput } from "./types/api-definition";
export type { ArgTypes } from "./types/route-definition";

const root = defineRoute({
  bag: {
    __search: {
      q: {
        type: "string",
      },
      page: {
        type: 'number',
        optional: true,
      },
    },
    pocket: {
      __argType: 'string',
      __search: {
        page: {
          type: 'number'
        }
      }
    }
  }
});

// params is showing an error, ask if you want the text of it
console.log(root.bag.path({ params: { q: "yes" } }));
console.log(root.bag.pocket('foo').path({ params: { page: 5 } }))