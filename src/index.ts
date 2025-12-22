import { buildFromNodule, buildNodules, buildRoutes } from './builder';
import { useRouteParams } from './resolver';
import { Nodule, Segment } from './segment';
import { RouterAPI } from './types/api-definition';
import { RouteDefinition } from './types/route-definition';

const segment = new Segment(null, null);
const nodule = new Nodule(null, '/');
export const defineRoute = <const T extends RouteDefinition>(
    routeDefinition: T
): RouterAPI<T> => {
    buildNodules(routeDefinition, nodule);
    // debugger;
    return buildFromNodule(routeDefinition, nodule);
    return buildRoutes(routeDefinition, segment);
};

export type { PathOptions, SearchParamsInput } from './types/api-definition';
export type { ArgTypes } from './types/route-definition';

// const [root, resolveLocation] = defineRoute({
//     rooms: {
//         roomId: {
//             __argType: 'string',
//             windows: {
//                 __search: {
//                     open: {
//                         type: 'number',
//                     },
//                     dirty: {
//                         type: 'boolean',
//                     },
//                 },
//             },
//         },
//         // doom: {},
//     },
// });
const root = defineRoute({
    one: {
        __argType: 'string',
        two: {
            __argType: 'number',
        },
        three: {
            __search: {
                foo: 'number',
                bar: 'string',
            },
        },
        four: {
            __argType: 'string',
        },
    },
});
console.log(root.one('foo').two(1).segments());
console.log(root.one('foo').two(1).path());
console.log(root.one('foo').two().template());
console.log(root.one().three.path({ params: { foo: 1, bar: '1' } }));
// debugger;
// console.log(root.rooms.roomId('ssd').path());
const printSegment = (seg: Segment, indent = '') => {
    console.log(`${indent}name: ${seg.segmentOnly()}`);
    seg.children.forEach((c) => printSegment(c, indent + '  '));
};

// printSegment(segment);

// const f = root.one('a');
// debugger;
// // console.log(segment.children);
// const path = '/rooms/foo/windows?open=3&clean=true';
// const foo = useRouteParams(root.one(), segment);
// const reolved = resolveLocation(path)
