# safe passage

type-safe route definition.

```ts
const root = defineRoute({
    rooms: {
        roomId: {
            __argType: 'string',
            doors: {},
            windows: {
                __search: {
                    open: {
                        type: 'number',
                    },
                    clean: {
                        type: 'boolean',
                        optional: true,
                    },
                },
            },
        },
    },
});

root.rooms.path();
// /rooms
root.rooms.roomId().path();
// /rooms/:roomId
root.rooms.roomId('foo').path();
// /rooms/foo
root.rooms.roomId('foo').doors.path();
// /rooms/foo/doors
room.rooms.roomId('foo').windows.path({ params: { open: 4, clean: false } });
// /rooms/foo/windows?open=4&clean=false
```
