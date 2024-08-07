import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';

export function styleMenuItemContent(parent: string, style: StyleRule) {
    globalStyle(`${parent} .react-contexify__item__content`, style);
}
