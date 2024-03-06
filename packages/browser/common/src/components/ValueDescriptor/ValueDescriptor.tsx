import { LoadingOutlined } from '@ant-design/icons';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { TComponentValueDescriptor } from '../../utils/React/useValueDescriptorObservable';
import { isUnsyncedValueDescriptor } from '../../utils/ValueDescriptor/utils';
import { Alert } from '../Alert';
import { cnAlert, cnAlertSuccess } from './ValueDescriptor.css';

function hashDescriptor<T>(descriptor: TComponentValueDescriptor<T>): string {
    return `${descriptor.state}-${isNil(descriptor.fail)}-${descriptor.isBroken}-
        ${descriptor.meta?.pendingState}`;
}
function hashDescriptors<T>(descriptors: TComponentValueDescriptor<T>[]): string {
    return descriptors.map(hashDescriptor).join('|');
}

export const ValueDescriptorsBadge = memo(
    (props: { descriptors: TComponentValueDescriptor<unknown>[] }) => {
        const isBroken = props.descriptors.some((desc) => desc.isBroken);
        const hasFail = props.descriptors.some(
            (desc) => isUnsyncedValueDescriptor(desc) && !isNil(desc.fail),
        );
        const hasPending = props.descriptors.some(
            (desc) => isUnsyncedValueDescriptor(desc) && !isNil(desc.meta?.pendingState),
        );

        let type: 'success' | 'info' | 'warning' | 'error' = 'success';
        let icon;
        let message = 'Loaded';
        let className = cnAlertSuccess;

        if (isBroken) {
            type = 'error';
            message = 'Broken';
            className = '';
        }

        if (hasFail) {
            icon = <LoadingOutlined />;
            type = 'warning';
            message = 'Data loss';
            className = '';
        }

        if (hasPending) {
            icon = <LoadingOutlined />;
            type = 'info';
            message = hasFail ? 'Restoring connection' : 'Loading';
            className = '';
        }

        return (
            <Alert className={cn(cnAlert, className)} type={type} message={message} icon={icon} />
        );
    },
    (a, b) => hashDescriptors(a.descriptors) === hashDescriptors(b.descriptors),
);
