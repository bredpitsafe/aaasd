import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';
import type { Properties } from 'csstype';

export function styleCardScroll(parent: string): StyleRule {
    styleCardBody(parent, {
        overflow: 'auto',
    });

    return {
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    };
}

export function styleCardBody(parent: string, rule: Properties): void {
    globalStyle(`${parent} > .ant-card-body`, rule);
}
