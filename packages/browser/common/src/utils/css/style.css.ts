import { style as _style, StyleRule } from '@vanilla-extract/css';

export { styleVariants, keyframes } from '@vanilla-extract/css';

export const style = (...rules: Array<StyleRule | string>) => _style(rules);
