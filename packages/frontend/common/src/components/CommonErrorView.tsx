import dayjs from 'dayjs';
import { ReactElement } from 'react';

import { TNotificationProps } from '../modules/notifications/def.ts';
import { TWithClassname, TWithStyle } from '../types/components';
import { EDateTimeFormats } from '../types/time';
import { cnHeader } from './CommonErrorView.css';

const getTime = (timestamp: number) => dayjs(timestamp).format(EDateTimeFormats.TimeMilliseconds);

export function CommonErrorTitleView(props: TNotificationProps): ReactElement {
    return (
        <div className={cnHeader}>
            {/* Only extract socket path to shorten error text, because every socket has same domain as app */}
            {props.socketURL && <span title="Socket">{new URL(props.socketURL).pathname}</span>}
            {props.socketURL && props.timestamp && ' | '}
            {props.timestamp && <span title="Timestamp">{getTime(props.timestamp)}</span>}
            {props.timestamp && props.traceId && ' | '}
            {props.traceId && <span title="Trace ID">{props.traceId}</span>}
        </div>
    );
}

export function CommonErrorView(
    props: TWithClassname & TWithStyle & TNotificationProps,
): ReactElement {
    return (
        <div className={props.className} style={props.style}>
            <CommonErrorTitleView {...props} />
            <div>{props.message}</div>
        </div>
    );
}
