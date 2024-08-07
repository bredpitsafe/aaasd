import type { EVirtualViewport } from '../../components/ChartViewport/defs';
import { createValueChangeDetector } from './createValueChangeDetector';

export function createViewportChangeDetector<T>(
    getCurrent: (data?: T) => EVirtualViewport | undefined,
): (data: T) => boolean {
    return createValueChangeDetector<T, EVirtualViewport | undefined>(getCurrent);
}
