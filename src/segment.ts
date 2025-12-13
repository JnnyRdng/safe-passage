import { PathOptions } from './types/api-definition'
import { RelativeFrom } from './types/types'
import { toSearchParams } from './utils'

export class Segment {
    constructor(
        private readonly segment: string | null,
        private readonly parent: Segment | null
    ) {}

    path(options?: PathOptions): string {
        const segments = this.segments()
        const full = `/${segments.join('/')}${toSearchParams(options?.params)}`
        return full.replace(/\/+/, '/')
    }

    segmentOnly(): string {
        return this.segment ?? '/'
    }

    segments(): string[] {
        const segments: string[] = [this.segmentOnly()]
        let parent = this.parent
        while (parent !== null) {
            segments.unshift(parent.segmentOnly())
            parent = parent.parent
        }
        return segments
    }

    relativeFrom(prevLocation: RelativeFrom): string {
        const fromParts = this.segments()
        if (typeof prevLocation === 'object') {
            prevLocation = prevLocation.path()
        }
        const toParts = prevLocation
            .replace(/\/+/, '/')
            .split('/')
            .filter(Boolean)

        let i = 0
        while (
            i < fromParts.length &&
            i < toParts.length &&
            fromParts[i] === toParts[i]
        ) {
            i++
        }

        const down = toParts.length - i
        const up = fromParts.slice(i)

        return `${new Array(down).fill('..').join('/')}${
            down && up.length ? '/' : ''
        }${up.join('/')}`
    }
}
