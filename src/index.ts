import { buildRoutes } from './builder'
import { Segment } from './segment'
import { RouterAPI } from './types/api-definition'
import { RouteDefinition } from './types/route-definition'

type ResolveLocation = (location: string) => {
    node: RouterAPI<any>
    args: Record<string, unknown>
    params: Record<string, unknown>
} | null

export const defineRoute = <const T extends RouteDefinition>(
    routeDefinition: T
): [RouterAPI<T>, ResolveLocation | null] => [
    buildRoutes(routeDefinition),
    null,
]

export type { PathOptions, SearchParamsInput } from './types/api-definition'
export type { ArgTypes } from './types/route-definition'

const [root, resolveLocation] = defineRoute({
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
        doom: {},
    },
})
console.log(root.rooms.roomId('ssd').path())
const path = '/rooms/foo/windows?open=3&clean=true'
// const reolved = resolveLocation(path)
