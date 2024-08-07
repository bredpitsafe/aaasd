import type { StyleRule } from '@vanilla-extract/css';
import { globalStyle } from '@vanilla-extract/css';

export function styleFormItem(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-form-item:not(#\\9)`, style);
}

export function styleFormItemLabelContainer(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-form-item-label:not(#\\9)`, style);
}

export function styleFormItemLabel(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-form-item-label:not(#\\9) > label`, style);
}

export function styleFormItemRow(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-form-item-row:not(#\\9)`, style);
}

export function styleFormItemControl(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-form-item-control:not(#\\9)`, style);
}

export function styleFormItemControlInput(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-form-item-control-input:not(#\\9)`, style);
}

export function styleFormItemControlInputContent(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-form-item-control-input-content:not(#\\9)`, style);
}

export function styleVerticalFitFormItemContent(parent: string) {
    styleFormItemControl(parent, { display: 'flex', flexGrow: 1, flexDirection: 'column' });
    styleFormItemControlInput(parent, { display: 'flex', flexGrow: 1, flexDirection: 'column' });
    styleFormItemRow(parent, { height: '100%' });
    styleFormItemControlInputContent(parent, {
        display: 'flex',
        flexGrow: 1,
        flexDirection: 'column',
        width: '100%',
    });
}

export function styleFormNumberItem(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-input-number:not(#\\9)`, style);
}

export function styleFormInputAffixWrapper(parent: string, style: StyleRule) {
    globalStyle(`${parent} .ant-input-affix-wrapper:not(#\\9)`, style);
}
