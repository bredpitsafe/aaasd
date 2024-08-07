import { message } from 'antd';
import type { ArgsProps } from 'antd/es/message';
import type MessageApi from 'antd/es/message';

import { ModuleFactory } from '../../di';
import { cnMessage } from './index.css';

export type IModuleMessages = typeof MessageApi;
export type TMessageProps = ArgsProps;

export const ModuleMessages = ModuleFactory(() => {
    message.config({
        top: 30,
        prefixCls: cnMessage,
        duration: 1,
    });

    return message;
});
