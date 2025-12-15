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

## Partial root variables
Maybe this is bad route design, but what if I wanted
`/some/root/that-is/number-:num`
would need to change __argType to be an object
and to be fair maybe argtype _should_ be an object anyway
```ts
argType= {
  type: "string",
  pattern: 'number-:
}
```

# Issues
I can have