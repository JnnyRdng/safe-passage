import { buildRoutes } from "./builder";
import type { RouteDefinition } from "./types";

export const defineRoute = <const T extends RouteDefinition>(
  routeDefinition: T
) => buildRoutes(routeDefinition);

export type { ArgTypes, SearchParamsInput, PathOptions } from "./types";
