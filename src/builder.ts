import { Nodule, Segment } from './segment';
import { PathOptions, PublicMethods, RouterAPI } from './types/api-definition';
import { Params, RouteDefinition } from './types/route-definition';
import { RelativeFrom } from './types/types';
import {
    checkArgType,
    getPublicApiMethods,
    validateSearchParams,
} from './utils';

export const buildNodules = <const T extends RouteDefinition>(
    def: T & RouteDefinition,
    parent: Nodule
): void => {
    for (const key of Object.keys(def)) {
        const { __search, __argType, ...children } = def[
            key as keyof RouteDefinition
        ] as RouteDefinition;
        const child = new Nodule(parent, key);
        if (__argType !== undefined) {
            if (child.arg !== undefined) {
                debugger;
                throw new TypeError('Two argTypes specified!');
            }
            child.arg = __argType;
        }
        child.search = __search;
        buildNodules(children, child);
    }
};

export const buildFromNodule = <const T extends RouteDefinition>(
    def: T & RouteDefinition,
    parent: Nodule
): RouterAPI<T> => {
    const api: any = {};
    for (const key of Object.keys(def)) {
        if (disallowedKeys.includes(key)) {
            throw new TypeError(`Invalid key '${key}'. Restricted keyword.`);
        }
        const { __search, __argType, ...children } = def[
            key as keyof RouteDefinition
        ] as RouteDefinition;
        const hasChildren =
            children &&
            typeof children === 'object' &&
            Object.keys(children).length > 0;
        const nodule = parent.getChildBySegmentName(key)!;
        if (__argType !== undefined) {
            api[key] = function (value?: any) {
                if (
                    value !== undefined &&
                    arguments.length > 0 &&
                    !checkArgType(__argType, value)
                ) {
                    throw new TypeError(
                        `Invalid type for segment "${key}". Expected ${__argType}, got ${typeof value}`
                    );
                }
                nodule.value = value;
                const v = arguments.length === 0 ? `:${key}` : key;
                nodule.argName = v;
                return hasChildren
                    ? buildFromNodule(children, nodule)
                    : publicApiMethods(nodule, nodule.search);
            };
        } else {
            api[key] = hasChildren
                ? buildFromNodule(children, nodule)
                : publicApiMethods(nodule, nodule.search);
        }
    }

    Object.assign(api, publicApiMethods(parent, parent.search));
    return api as RouterAPI<T>;
};

const publicApiMethods = <S extends Params | undefined = undefined>(
    nodule: Nodule,
    search?: S
): PublicMethods<S> => ({
    path: (options?: PathOptions<S>) => {
        if (search && options?.params) {
            validateSearchParams(search, options.params, nodule.path());
        }
        return nodule.path(options);
    },
    template: () => nodule.template(),
    segment: () => nodule.segmentOnly(),
    segments: () => nodule.segments(),
    relativeFrom: (prevLocation: RelativeFrom) =>
        nodule.relativeFrom(prevLocation),
});

const disallowedKeys = ['path', 'segment', 'segmentOnly'];

export const buildRoutes = <const T extends RouteDefinition>(
    def: T & RouteDefinition,
    parent: Segment
): RouterAPI<T> => {
    const api: any = {};

    for (const key of Object.keys(def)) {
        if (key === 'path') throw new TypeError('Cannot be called path');
        // if (key in api) {
        // debugger;
        // }
        const { __search, __argType, ...children } = def[
            key as keyof RouteDefinition
        ] as RouteDefinition;

        // console.log(JSON.stringify(def), key);
        const hasChildren =
            children &&
            typeof children === 'object' &&
            Object.keys(children).length > 0;

        if (__argType !== undefined) {
            const childSegment = new Segment(`:${key}`, parent);
            childSegment.routeArg = key;
            api[key] = function (value?: any) {
                const v = arguments.length === 0 ? `:${key}` : value; // ← use :keyName if no argument
                childSegment.setSegment(v);
                // runtime type checking only if a real value is provided
                // debugger;
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

                return hasChildren
                    ? buildRoutes(children, childSegment)
                    : getPublicApiMethods(
                          childSegment,
                          __search as typeof __search
                      );
            };
        } else {
            const childSegment = new Segment(key, parent);
            api[key] = hasChildren
                ? buildRoutes(children, childSegment)
                : getPublicApiMethods(
                      childSegment,
                      __search as typeof __search
                  );
        }
    }

    const segmentForApi = parent;
    Object.assign(
        api,
        getPublicApiMethods(segmentForApi, def.__search as typeof def.__search)
    );
    return api as RouterAPI<T>;
};
