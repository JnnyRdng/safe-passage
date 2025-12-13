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
const result = root.rooms.match("/rooms?q=hello&page=2");
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
paramName: 'string[]'
```
