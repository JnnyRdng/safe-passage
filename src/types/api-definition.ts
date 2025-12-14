import {
    DefinitionKeys,
    InferSearchParams,
    Params,
    ParamType,
} from './route-definition';
import { RelativeFrom, TypeMap } from './types';

// Strip __argType for child type inference
type Clean<T> = {
    [K in keyof T as K extends '__argType' ? never : K]: T[K];
};

/** URL Search Params definition */
export type SearchParamsInput = Record<string, ParamType>;

/** Options for printing a path to a string */
export type PathOptions<P extends Params | undefined = undefined> = {
    params?: InferSearchParams<P>;
};

/** Public methods exposed to each segment in a route */
export type PublicMethods<P extends Params | undefined = undefined> = {
    /**Print the absolute path.  */
    path(options?: PathOptions<P>): string;
    toString: () => string;
    /** Return the segment name */
    segment(): string;
    /** Return the path as an array of segments */
    segments(): string[];
    /** Get the relative path from the `prevLocation` */
    relativeFrom(prevLocation: RelativeFrom): string;
};

/** A traversable, callable tree of route segments */
export type RouterAPI<
    T,
    S extends Params | undefined = T extends { __search: infer X }
        ? X extends Params
            ? X
            : undefined
        : undefined,
> = PublicMethods<S> & {
    [K in keyof T as K extends DefinitionKeys ? never : K]: T[K] extends {
        __argType: infer A;
    }
        ? (
              value?: A extends keyof TypeMap ? TypeMap[A] : never
          ) => RouterAPI<Clean<T[K]>>
        : RouterAPI<
              Clean<T[K]>,
              Clean<T[K]> extends { __search: infer X }
                  ? X extends Params
                      ? X
                      : undefined
                  : undefined
          >;
};
