// router.ts
type Types = "string" | "number" | "boolean" | "bigint" | "symbol";

/* ====== Input DSL types (you already had these) ====== */

// A leaf may or may not have __type
type Leaf = {
  __type?: Types;
};

// A route node: may have __type and arbitrary child Defs
type RouteNode = {
  __type?: Types;
} & {
  [K in Exclude<string, "__type">]?: Def;
};

export type Def = Leaf | RouteNode;

/* ====== Compile-time mapped types for the output router ====== */

/** Utility: append segment to prefix */
type AppendPrefix<P extends string, S extends string> = P extends "" ? `/${S}` : `${P}/${S}`;

/** ChildrenOf<D> is the object containing only the literal child keys (excluding "__type") */
type ChildrenOf<D> = D extends object ? Omit<D, "__type"> : {};

/** Detect whether a given child type literal has the __type key present */
type HasTypeProp<D> = D extends { __type: any } ? (undefined extends D["__type"] ? true : true) : false;

/**
 * The Router type produced for a Def D.
 * - path(): string
 * - exact set of child properties (no index signature)
 */
export type RouterFor<D extends Def, P extends string = ""> = {
  path(): string;
} & {
  [K in keyof ChildrenOf<D> & string]: SegmentFor<
    K,
    // ChildDef may be optional in the input; make it required here for mapping
    NonNullable<ChildrenOf<D>[K]>,
    AppendPrefix<P, K>
  >;
};

/**
 * SegmentFor<Name, ChildDef, Prefix>
 * If the child has a __type property (present in the literal), then it is dynamic:
 *   - it is callable: (id?: string) => RouterFor<...>
 *   - and the callable also has nested child properties and .path()
 * If not dynamic, it is a plain RouterFor object.
 */
type SegmentFor<Name extends string, C extends Def, P extends string> =
  HasTypeProp<C> extends true
    ? // callable & object
      ((id?: string) => RouterFor<C, P>) & RouterFor<C, P>
    : // plain object
      RouterFor<C, P>;

/* ====== Runtime builder ====== */

/**
 * buildRouter(def, prefix)
 * - returns an object whose shape matches RouterFor<D,P>
 * - no index signatures leak into the returned object's type because RouterFor is keyed by literal keys
 */
const buildRouter = <D extends Def>(def: D, prefix = ""): RouterFor<D, typeof prefix> => {
  // runtime record we'll populate and then cast
  const out: Record<string, any> = {};

  // path() for this node
  out.path = () => (prefix === "" ? "" : prefix);

  // iterate only own keys (skip "__type")
  for (const key of Object.keys(def).filter((k) => k !== "__type")) {
    const childDef = (def as any)[key] as Def | undefined;
    const child = (childDef ?? {}) as Def;

    const childPrefix = prefix === "" ? `/${key}` : `${prefix}/${key}`;

    const isDynamic = "__type" in child && (child as any).__type !== undefined;

    if (isDynamic) {
      // create callable function (unfilled)
      const makeInstance = (filledId?: string) => {
        // instance object used when the segment has been "called" (may have filledId)
        const inst: Record<string, any> = {};

        // path: if filledId provided use the literal, otherwise use :name
        inst.path = () =>
          (filledId ? `${childPrefix}/${filledId}` : `${childPrefix}/:${key}`).replace(/\/+/g, "/");

        // attach children (so you can traverse after calling)
        const childRouter = buildRouter(child, inst.path());
        Object.assign(inst, childRouter);

        return inst as RouterFor<typeof child, string>;
      };

      // the callable itself (unfilled)
      const fn: any = (id?: string) => makeInstance(id);

      // path() on the callable (unfilled)
      fn.path = () => `${childPrefix}/:${key}`;

      // attach children to the callable so traversal without calling works
      const childRouterForCallable = buildRouter(child, fn.path());
      Object.assign(fn, childRouterForCallable);

      out[key] = fn;
    } else {
      // static child: just an object with its path and nested children
      out[key] = buildRouter(child, childPrefix);
    }
  }

  return out as RouterFor<D, typeof prefix>;
};

/** public factory */
export const createRouter = <D extends Def>(def: D) => {
  // root.path() returns '/'
  return buildRouter(def, "") as RouterFor<D, "">;
};

/* ====== Example usage ====== */

const routeDef = {
  rooms: {
    roomId: {
      __type: "string",
      doors: {
        doorId: {
          __type: "string",
        },
      },
      windows: {},
    },
  },
  foo: {
    __type: "number",
    bar: {}
  }
} as const satisfies Def;

export const root = createRouter(routeDef);

/* ====== Examples (type-check + runtime) ====== */

// Compile-time: these are typed and produce intellisense
// root.rooms           // valid
// root.rooms.roomId    // callable + has children
// root.rooms.windows   // valid
// root.room            // ❌ compile-time error: Property 'room' does not exist

// Runtime checks:
console.log(root.path());                       // "/"
console.log(root.rooms.path());                 // "/rooms"
// console.log(root.rooms.windows.path());         // "/rooms/windows"
console.log(root.rooms.roomId.path());          // "/rooms/roomId" ??? <-- note: path() on uncalled callable returns "/rooms/roomId/:roomId" because we set the template below
console.log(root.rooms.roomId().path());        // "/rooms/:roomId"
console.log(root.rooms.roomId("123").path());   // "/rooms/123"
console.log(root.rooms.roomId("123").doors.doorId().path()); // "/rooms/123/doors/:doorId"
console.log(root.foo('yes').bar.path())


/*

This kind of wors, but does not have:
- autorenmaing of properties. F2 on a property in routeDef should update the build root object
- types on the id segments. i want to be able to say "this should accept a string" or "this should accept a number"