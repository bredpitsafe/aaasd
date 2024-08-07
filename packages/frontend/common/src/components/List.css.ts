import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';

export function styleListActionsContainer(parent: string, rule: StyleRule): void {
    globalStyle(`${parent} > .ant-list-item-action:not(#\\9)`, rule);
}

export function styleListAction(parent: string, rule: StyleRule): void {
    globalStyle(`${parent} > .ant-list-item-action > li:not(#\\9)`, rule);
}

export function styleListActionSplit(parent: string, rule: StyleRule): void {
    globalStyle(
        `${parent} > .ant-list-item-action > li > .ant-list-item-action-split:not(#\\9)`,
        rule,
    );
}
