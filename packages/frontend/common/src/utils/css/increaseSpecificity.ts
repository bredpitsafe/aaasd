import type { StyleRule } from '@vanilla-extract/css';

const cargo = ':not(#\\9)';

export function increaseSpecificity<T extends StyleRule>(value: T, times = 1): StyleRule {
    const selector = times === 1 ? cargo : new Array(times).fill(cargo).join('');
    return { [selector]: value } as StyleRule;
}
