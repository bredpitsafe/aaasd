import { globalStyle, StyleRule } from '@vanilla-extract/css';

export function styleTooltipContainer(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-tooltip-inner:not(#\\9)`, style);
}
