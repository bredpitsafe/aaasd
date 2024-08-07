import { LoadingOutlined } from '@ant-design/icons';
import cn from 'classnames';
import { memo } from 'react';

import { useValueDescriptorsStatus } from '../../hooks/useValueDescriptorStatus.ts';
import type { TComponentValueDescriptor } from '../../utils/React/useValueDescriptorObservable';
import { Alert } from '../Alert';
import { hashDescriptors } from './hashDescriptors.ts';
import { cnAlert, cnAlertSuccess } from './ValueDescriptorsBadge.css.ts';

export const ValueDescriptorsBadge = memo(
    (props: { descriptors: TComponentValueDescriptor<unknown>[] }) => {
        const { isBroken, hasFail, hasPending } = useValueDescriptorsStatus(props);

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
