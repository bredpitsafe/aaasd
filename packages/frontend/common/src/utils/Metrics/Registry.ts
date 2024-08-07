import type { Constructor } from '@common/types';
import type { Registry as IRegistry } from 'prom-client';
// @ts-ignore
import BaseRegistry from 'prom-client/lib/registry.js';

import type { Summary } from './Summary';

// HACK: prom-client is a node.js library, and that's why we can't import implementations from the index module
export class Registry extends (BaseRegistry as any as Constructor<IRegistry>) {
    private _defaultLabels!: Record<string, string>;

    constructor() {
        super();
    }

    getMetrics(): (Summary | unknown)[] {
        return super.getMetricsAsArray();
    }

    getDefaultLabels(): Record<string, string> {
        return this._defaultLabels;
    }
}
