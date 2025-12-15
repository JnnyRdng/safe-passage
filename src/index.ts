import { buildRoutes } from './builder';
import { NodeArgs, NodeParams, ResolveResult, resolveRoute } from './resolver';
import { Segment } from './segment';
import { RouterAPI } from './types/api-definition';
import { RouteDefinition } from './types/route-definition';
import { inspect } from 'util';

export const defineRoute = <const T extends RouteDefinition>(
    routeDefinition: T
) => {
    const node = new Segment(null, null, undefined);
    const root = buildRoutes(routeDefinition, node);
    const resolver = (apiNode: any, url: string) =>
        resolveRoute<typeof apiNode>(apiNode, url, node);
    // console.log(node);
    return { root, resolver };
};

export type { PathOptions, SearchParamsInput } from './types/api-definition';
export type { ArgTypes } from './types/route-definition';

const { root, resolver } = defineRoute({
    rooms: {
        roomId: {
            __argType: 'string',
            windows: {
                __search: {
                    open: {
                        type: 'number',
                    },
                    dirty: {
                        type: 'boolean',
                    },
                },
            },
        },
    },
});

console.log(
    root.rooms
        .roomId('blah')
        .windows.path({ params: { open: 3, dirty: false } })
);

const path = '/rooms/my-nice-room/windows?open=3&clean=true';
const { node, args, search } = resolver(root, path);
// console.log('inspect', inspect(node, { depth: 10 }));
// console.log('\n\n');
console.log(node, args, search);
console.log(node === root.rooms.roomId().windows.segment());
