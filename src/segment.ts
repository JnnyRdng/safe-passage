import { PathOptions } from './types/api-definition';
import { ArgTypes, Params } from './types/route-definition';
import { RelativeFrom } from './types/types';
import { toSearchParams } from './utils';

export class Nodule {
    readonly children: Nodule[];
    parent: Nodule | null;
    segmentName: string;
    argName?: string | undefined;
    search?: Params;
    arg?: ArgTypes;
    value?: any;

    constructor(parent: Nodule | null, segmentName: string) {
        this.children = [];
        this.parent = parent;
        parent?.children.push(this);
        this.segmentName = segmentName;
    }

    getChildBySegmentName(name: string): Nodule | undefined {
        return this.children.find((c) => c.segmentName === name);
    }

    path(options?: PathOptions): string {
        return this.segments()
            .join('/')
            .replaceAll(/\/{2,}/g, '/');
    }

    template() {
        return this.templateSegments()
            .join('/')
            .replaceAll(/\/{2,}/g, '/');
    }

    segmentOnly(): string {
        return this.argName ?? this.segmentName;
    }

    templateSegments() {
        const segments = [];
        let parent: Nodule | null = this;
        while (parent !== null) {
            segments.unshift(parent.value ?? parent.segmentOnly());
            parent = parent.parent;
        }
        return segments;
    }

    segments(): string[] {
        const segments = [];
        let parent: Nodule | null = this;
        while (parent !== null) {
            segments.unshift(parent.segmentOnly());
            parent = parent.parent;
        }
        return segments;
    }

    relativeFrom(location: RelativeFrom): string {
        return '';
    }
}

export class Segment {
    readonly children: Segment[];
    constructor(
        private segment: string | null,
        private readonly parent: Segment | null,
        private argName?: string | undefined
    ) {
        this.children = [];
        parent?.children.push(this);
        if (parent) {
            // debugger;
        }
        // debugger;
    }

    setSegment(value: string) {
        this.segment = value;
    }

    set routeArg(arg: string) {
        this.argName = arg;
    }

    get routeArg() {
        return this.argName ?? this.segment ?? '';
    }

    getChildBySegmentName(segmentName: string): Segment | undefined {
        if (segmentName.startsWith(':')) {
            segmentName = segmentName.substring(1);
        }
        const child = this.children.find(
            (c) => c.segmentOnly() === segmentName
        );
        // console.log(child?.children);
        // console.log('child', segmentName, child?.segmentOnly());
        return child;
    }

    path(options?: PathOptions): string {
        const segments = this.segments();
        const full = `/${segments.join('/')}${toSearchParams(options?.params)}`;
        return full.replace(/\/+/, '/');
    }

    segmentOnly(): string {
        return this.segment ?? '/';
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

    relativeFrom(prevLocation: RelativeFrom): string {
        const fromParts = this.segments();
        if (typeof prevLocation === 'object') {
            prevLocation = prevLocation.path();
        }
        const toParts = prevLocation
            .replace(/\/+/, '/')
            .split('/')
            .filter(Boolean);

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

        return `${new Array(down).fill('..').join('/')}${
            down && up.length ? '/' : ''
        }${up.join('/')}`;
    }
}
