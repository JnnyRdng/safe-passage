# Want:

## Metadata for each segment

```ts
  rooms: {

    __meta: {
      title: "Page Title",
    },

  },
```

Expose a `meta(): string | undefined` method on the node to get the page title

## Route matching and parsing

Add a `match(url:string): { node: RouterAPI, params: {}}` method to parse the page location.

```ts
const result = root.rooms.match('/rooms?q=hello&page=2');
result.params.q; // string
result.params.page; // number | undefined
```

## Middleware guards?

Middleware / guards per node

Could allow something like:

```ts
rooms: {
  __guard: (user) => user.isLoggedIn,
}
```

Runtime checks could prevent building paths or performing actions on unauthorized nodes.

## Params

Change the params type so that i can shorthand it for a required param
i.e instead of

```ts
paramName: {
  type: 'string[]',
}
```

it could be written as:

```ts
paramName: 'string[]';
```

# It's just not quite right.

The segments don't quite give me what I need. There are multiple (duplicate) children occurring, and there aren't children where there are meant to be some.

I think I need to rebuild the segments.

First, traverse the route definition and build a complete segment tree.
Then, when I have that, I can traverse the segment tree and build the API tree.
Then, I can use the segment tree as part of the route matching resolver.
