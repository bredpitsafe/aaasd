/* eslint-disable @typescript-eslint/no-unsafe-declaration-merging */
import type { Constructor } from '@common/types';
import type { Summary as ISummary } from 'prom-client';
// @ts-ignore
import BaseSummary from 'prom-client/lib/summary.js';

import type { Registry } from './Registry';
import type { ITimeWindowQuantiles } from './types';

// HACK: prom-client is a node.js library, and that's why we can't import implementations from the index module
export class Summary extends (BaseSummary as any as Constructor<ISummary>) {}

/**
 * HACK: In the implementation, Summary inherits from the Module class, but this is not reflected in the types,
 * as the authors did not intend to use properties inherited from Module
 */
export interface Summary {
    name: string;
    percentiles: number[];
    hashMap: Record<
        string,
        {
            labels: [string, string];
            count: number;
            sum: number;
            td: ITimeWindowQuantiles;
        }
    >;

    registers: Registry[];
}
