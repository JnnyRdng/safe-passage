import { TypeMap } from './types';

export type DefinitionKeys = '__argType' | '__search';

/** The allowable arg types for a route parameter */
export type ArgTypes = 'string' | 'number' | 'boolean' | 'bigint' | 'symbol';

type LeafNode = {
    __argType?: ArgTypes;
    __search?: Params;
};

export type ParamType =
    | string
    | number
    | boolean
    | string[]
    | number[]
    | boolean[]
    | undefined
    | null;

export type ParamLiteral =
    | 'string'
    | 'number'
    | 'boolean'
    | 'string[]'
    | 'number[]'
    | 'boolean[]';
export interface Param {
    type: ParamLiteral;
    optional?: boolean;
}
export interface Params {
    [key: string]: Param;
}

type ParamToTS<P extends Param> = TypeMap[P['type']];

type RequiredParams<S extends Params> = {
    [K in keyof S as S[K]['optional'] extends true ? never : K]: ParamToTS<
        S[K]
    >;
};

type OptionalParams<S extends Params> = {
    [K in keyof S as S[K]['optional'] extends true ? K : never]?: ParamToTS<
        S[K]
    >;
};

export type InferSearchParams<S extends Params | undefined> = S extends Params
    ? RequiredParams<S> & OptionalParams<S>
    : {};

type RouteNode = {
    __argType?: ArgTypes;
    __search?: Params;
} & {
    [K in Exclude<string, DefinitionKeys>]?: RouteDefinition;
};

/** A route definition */
export type RouteDefinition = LeafNode | RouteNode;
