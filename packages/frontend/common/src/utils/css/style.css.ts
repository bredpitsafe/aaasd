import type { StyleRule } from '@vanilla-extract/css';
import { style as _style } from '@vanilla-extract/css';

export { styleVariants, keyframes } from '@vanilla-extract/css';

export const style = (...rules: Array<StyleRule | string>) => _style(rules);
