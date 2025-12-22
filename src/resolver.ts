//@ts-nocheck
import { Segment } from './segment';
import { RouterAPI } from './types/api-definition';
import { ArgTypes } from './types/route-definition';

type ExtractUrlParams<T> = T extends { __argType: infer ArgType }
    ? {
          [K in keyof T]: K extends '__argType'
              ? never
              : ExtractUrlParams<T[K]>;
      } & {
          __arg: ArgType;
      }
    : T extends object
      ? {
            [K in keyof T]: K extends '__argType' | '__search'
                ? never
                : ExtractUrlParams<T[K]>;
        }
      : never;

type ExtractSearchParams<T> = T extends { __search: infer Search }
    ? Search extends Record<
          string,
          { type: infer Type; optional?: infer Optional }
      >
        ? {
              [K in keyof Search]: Search[K] extends {
                  type: infer T;
                  optional: true;
              }
                  ? ParseType<T> | undefined
                  : ParseType<T>;
          }
        : never
    : Record<string, never>;

type ParseType<T> = T extends 'string'
    ? string
    : T extends 'number'
      ? number
      : T extends 'boolean'
        ? boolean
        : never;

export function useRouteParams<T extends RouterAPI<Clean<any>>>(
    node: T,
    rootSegment: Segment
): {
    params: ExtractUrlParams<T>;
    searchParams: ExtractSearchParams<T>;
} {
    // const location = useLocation();
    const location = { pathname: '/a/two' };

    // 1. Get the route pattern from the node (you'll need to store this)
    const pattern = node.path(); // e.g., "/rooms/:roomId/windows"

    const segment = getSegmentForNode(node, rootSegment);
    console.log(segment?.segments());

    // 2. Match current location against pattern
    // const urlParams = matchPattern(segment, pattern, location.pathname);

    // 3. Parse search params according to __search definition
    // const searchParams = parseSearchParams(
    // new URLSearchParams(location.search),
    // node.__search
    // );

    // return { params: urlParams, searchParams };
}

const getSegmentForNode = (
    node: RouterAPI<any>,
    root: Segment
): Segment | null => {
    const nodes = node.segments().filter((n) => n !== '/');
    console.log('NODES', nodes);
    let s = root;
    nodes.forEach((n) => {
        s = root.getChildBySegmentName(n);
        // console.log(s);
        console.log(s);
        if (s === null || s === undefined) {
            return null;
        }
    });
    console.log('got', s?.segmentOnly());
    return s;
};

const matchPattern = <T extends RouterAPI<any>>(
    segment: Segment,
    node: T,
    sActual: string
): ExtractUrlParams<T> => {
    console.log(node);
    const pattern = node.segments();
    const actual = sActual.split('?')[0].split('/');
    if (actual.length < pattern.length) {
        throw new Error('Actual URL is not long enough');
    }
};
