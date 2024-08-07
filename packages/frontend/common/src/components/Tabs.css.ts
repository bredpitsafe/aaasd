import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';

// .ant-tabs > .ant-tabs-tab
export function styleTab(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-tabs-tab:not(#\\9)`, style);
    globalStyle(`${parent} .ant-tabs-nav-more:not(#\\9)`, style);
}

// .ant-tabs > .ant-tabs-content-holder > .ant-tabs-content > .ant-tabs-tabpane
export function styleTabContentHolder(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-tabs-content-holder:not(#\\9)`, style);
}

export function styleTabContent(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-tabs-content:not(#\\9)`, style);
}

export function styleTabPane(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-tabs-tabpane-active:not(#\\9)`, style);
}

export function styleVerticalFitTabs(parent: string) {
    styleTabContentHolder(parent, {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
    });
    styleTabContent(parent, {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
    });
    styleTabPane(parent, {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
    });
}
