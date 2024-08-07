import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';

export function styleSelectSelector(parent: string, rule: StyleRule): void {
    globalStyle(`${parent} > .ant-select-selector:not(#\\9)`, rule);
}

export function styleSelectSuffix(parent: string, rule: StyleRule): void {
    globalStyle(`${parent} .ant-select-suffix:not(#\\9)`, rule);
}
