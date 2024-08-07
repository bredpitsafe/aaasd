import type { StyleRule } from '@vanilla-extract/css';

const cargo = ':not(#\\9)';

export const specify = <T extends StyleRule>(value: T, times = 1): StyleRule => {
    const selector = times === 1 ? cargo : new Array(times).fill(cargo).join('');
    // @ts-ignore TODO: Rule out complex type
    return { selectors: { ['&' + selector]: value } } as StyleRule;
};
