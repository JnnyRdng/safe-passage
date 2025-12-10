import { PathOptions, RelativeTo } from "./Types";
import { toSearchParams } from "./Utils";

export class Segment {
  constructor(
    private readonly segment: string | null,
    private readonly parent: Segment | null
  ) {}

  path(options?: PathOptions): string {
    const segments = this.segments();
    const full = `/${segments.join("/")}${toSearchParams(options?.params)}`;
    return full.replace(/\/+/, "/");
  }

  segmentOnly(): string {
    return this.segment ?? "/";
  }

  segments(): string[] {
    const segments: string[] = [this.segmentOnly()];
    let parent = this.parent;
    while (parent !== null) {
      segments.unshift(parent.segmentOnly());
      parent = parent.parent;
    }
    return segments;
  }

  relativeTo(location: RelativeTo): string {
    const fromParts = this.segments();
    if (typeof location === "object") {
      location = location.path();
    }
    const toParts = location.replace(/\/+/, "/").split("/").filter(Boolean);

    let i = 0;
    while (
      i < fromParts.length &&
      i < toParts.length &&
      fromParts[i] === toParts[i]
    ) {
      i++;
    }

    const down = toParts.length - i;
    const up = fromParts.slice(i);

    return `${new Array(down).fill("..").join("/")}${
      down && up.length ? "/" : ""
    }${up.join("/")}`;
  }
}
