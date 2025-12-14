import { Segment } from './segment';
import { RouterAPI } from './types/api-definition';
import { RouteDefinition } from './types/route-definition';
import { checkArgType, getPublicApiMethods } from './utils';

export const buildRoutes = <const T extends RouteDefinition>(
    def: T & RouteDefinition,
    parent: Segment | null = null
): RouterAPI<T> => {
    const api: any = {};

    for (const key of Object.keys(def)) {
        const { __search, __argType, ...children } = def[
            key as keyof RouteDefinition
        ] as RouteDefinition;

        const isArg =
            children &&
            typeof children === 'object' &&
            Object.hasOwn(children, '__argType');

        if (__argType !== undefined) {
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
                return Object.keys(children).length > 0
                    ? buildRoutes(children, childSegment)
                    : getPublicApiMethods(
                          childSegment,
                          __search as typeof __search
                      );
            };
        } else {
            const childSegment = new Segment(key, parent);
            const hasChildren =
                children &&
                typeof children === 'object' &&
                Object.keys(children).length > 0;
            api[key] = hasChildren
                ? buildRoutes(children, childSegment)
                : getPublicApiMethods(
                      childSegment,
                      __search as typeof __search
                  );
        }
    }

    const segmentForApi = parent ?? new Segment(null, null);
    Object.assign(
        api,
        getPublicApiMethods(segmentForApi, def.__search as typeof def.__search)
    );
    return api as RouterAPI<T>;
};
