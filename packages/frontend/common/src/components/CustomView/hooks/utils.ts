import type { TCellKey } from './defs';

export function getColumnName(index: number): TCellKey {
    return `column_${index}`;
}
