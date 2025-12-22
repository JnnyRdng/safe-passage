import { TypeMap } from './types';

export type DefinitionKeys = '__argType' | '__search';

/** The allowable arg types for a route parameter */
export type ArgTypes = 'string' | 'number' | 'boolean' | 'bigint' | 'symbol';

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
export type Param =
    | {
          type: ParamLiteral;
          required?: boolean;
      }
    | ParamLiteral;
export interface Params {
    [key: string]: Param;
}

type ParamToTS<P extends Param> = TypeMap[P extends object ? P['type'] : P];

type RequiredParams<S extends Params> = {
    [K in keyof S as S[K] extends object
        ? S[K]['required'] extends true
            ? K
            : never
        : never]: ParamToTS<S[K]>;
};

type OptionalParams<S extends Params> = {
    [K in keyof S as S[K] extends object
        ? S[K]['required'] extends true
            ? K
            : never
        : K]?: ParamToTS<S[K]>;
};

export type InferSearchParams<S extends Params | undefined> = S extends Params
    ? RequiredParams<S> & OptionalParams<S>
    : {};

type LeafNode = {
    __argType?: ArgTypes;
    __search?: Params;
};

type RouteNode = {
    __argType?: ArgTypes;
    __search?: Params;
} & {
    [K in Exclude<string, DefinitionKeys | 'path'>]?: RouteDefinition;
};

/** A route definition */
export type RouteDefinition = LeafNode | RouteNode;
