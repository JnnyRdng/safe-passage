/** A path or path-like input to find a relative path from */
export type RelativeFrom = string | { path: () => string };

/** Map Types to actual TS types */
export type TypeMap = {
    string: string;
    number: number;
    boolean: boolean;
    bigint: bigint;
    symbol: symbol;
    'string[]': string[];
    'number[]': number[];
    'boolean[]': boolean[];
};
