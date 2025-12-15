import { Segment } from './segment';
import { RouterAPI } from './types/api-definition';
import {
    InferSearchParams,
    Params,
    RouteDefinition,
} from './types/route-definition';

type ParseUrlResult = {
    segments: string[];
    search: URLSearchParams;
};
const parseUrl = (url: string): ParseUrlResult => {
    const [pathname, search] = url.split('?');
    const segments = pathname.split('/').filter(Boolean);
    const searchParams = new URLSearchParams(search);
    return { segments, search: searchParams };
};

export type NodeArgs<T> = T extends { [K in keyof T]: (v?: infer A) => any }
    ? { [K in keyof T]?: A }
    : {};

export type NodeParams<T> = T extends { __search: infer S }
    ? InferSearchParams<S & Params>
    : {};

export interface ResolveResult<TNode = any, TArgs = any, TParams = any> {
    node: TNode;
    args: TArgs;
    search: TParams;
}

export const resolveRoute = <T extends RouterAPI<any>>(
    routeNode: T,
    url: string,
    segment: Segment
) => {
    const { search, segments } = parseUrl(url);
    const args: Record<string, unknown> = {};

    return { node: {}, args: {}, search: {} };
};

export function _resolveRoute<T extends RouterAPI<RouteDefinition>>(
    root: T, // include public methods to satisfy TS
    url: string,
    rootSegment: Segment
): ResolveResult<
    T,
    any, // args typing can be improved later
    any // params typing can be improved later
> {
    const { search, segments } = parseUrl(url);

    const args: Record<string, unknown> = {};
    rootSegment.children.forEach((c) => console.log(c.segmentOnly()));
    const findNode = (
        node: any,
        segment: Segment,
        segIndex: number
    ): [any, Segment | null] => {
        // console.log(node.segments());
        if (segIndex >= segments.length) return [node, segment];

        const segmentValue = segments[segIndex];
        const nextSegment =
            segment?.children?.find((c) => c.segmentOnly() === segmentValue) ??
            segment?.children?.[0];
        for (const key of Object.keys(node)) {
            if (typeof node[key] === 'function') {
                // callable node = arg segment
                const nextNode = node[key](segmentValue);

                args[key] = segmentValue;
                const [found, foundSegment] = findNode(
                    nextNode,
                    nextSegment!,
                    segIndex + 1
                );
                if (found) return [found, foundSegment!];
            } else if (typeof node[key] === 'object') {
                // literal segment
                if (key === segmentValue) {
                    const [found, foundSegment] = findNode(
                        node[key],
                        nextSegment!,
                        segIndex + 1
                    );
                    if (found) return [found, foundSegment!];
                }
            }
        }

        return [null, null];
    };

    const [leafNode, leafSegment] = findNode(root, rootSegment, 0);
    // console.log('leafSegment', leafSegment);
    if (!leafNode || !leafSegment) throw new Error(`No route matched: ${url}`);

    // parse search params based on leaf node __search
    const params: Record<string, unknown> = {};
    const searchDef = (leafNode as any).__search as Params | undefined;

    // if (searchDef) {
    //     for (const [k, def] of Object.entries(searchDef)) {
    //         const value = search.get(k);
    //         if (value === null) {
    //             if (!def.optional)
    //                 throw new TypeError(`Missing required search param "${k}"`);
    //             params[k] = undefined;
    //         } else {
    //             // convert based on type
    //             switch (def.type) {
    //                 case 'string':
    //                     params[k] = value;
    //                     break;
    //                 case 'number':
    //                     params[k] = Number(value);
    //                     break;
    //                 case 'boolean':
    //                     params[k] = value === 'true';
    //                     break;
    //                 case 'string[]':
    //                     params[k] = value.split(',');
    //                     break;
    //                 case 'number[]':
    //                     params[k] = value.split(',').map(Number);
    //                     break;
    //                 case 'boolean[]':
    //                     params[k] = value.split(',').map((v) => v === 'true');
    //                     break;
    //             }
    //         }
    //     }
    // }

    return {
        node: leafNode,
        args: args as any, // could enhance typing with a mapped type from __argType path
        search: leafSegment.search,
        // search: params as any, // could enhance typing with InferSearchParams<typeof leafNode.__search>
    };
}
