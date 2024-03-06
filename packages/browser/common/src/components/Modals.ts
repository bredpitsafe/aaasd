export { Modal } from 'antd';
import { globalStyle, StyleRule } from '@vanilla-extract/css';

export function styleModalContent(parent: string, style: StyleRule) {
    globalStyle(`${parent}.ant-modal .ant-modal-content`, style);
}

export function styleModalContentBody(parent: string, style: StyleRule) {
    globalStyle(`${parent}.ant-modal .ant-modal-content .ant-modal-body`, style);
}
