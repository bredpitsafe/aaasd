import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';

export function styleRadioWrapper(parent: string, rule: StyleRule): void {
    globalStyle(`${parent} > .ant-radio-wrapper:not(#\\9)`, rule);
}
