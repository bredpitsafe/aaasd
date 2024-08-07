import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';

export function hideInputEmptyAddon(parent: string): void {
    styleInputEmptyAddon(parent, {
        display: 'none',
    });
}

export function styleInputAddon(parent: string, rule: StyleRule): void {
    globalStyle(`${parent} > .ant-input-wrapper > .ant-input-group-addon`, rule);
}

function styleInputEmptyAddon(parent: string, rule: StyleRule): void {
    globalStyle(`${parent} > .ant-input-wrapper > .ant-input-group-addon:empty`, rule);
}

export function styleInputPlaceHolder(parent: string, rule: StyleRule): void {
    globalStyle(`${parent} input:not(:disabled)::placeholder`, rule);
}
