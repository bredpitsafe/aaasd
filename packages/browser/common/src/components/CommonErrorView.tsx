import dayjs from 'dayjs';
import { ReactElement, ReactNode } from 'react';

import { TWithClassname, TWithStyle } from '../types/components';
import { EDateTimeFormats } from '../types/time';
import { TraceId } from '../utils/traceId';
import { cnHeader } from './CommonErrorView.css';

const getTime = (timestamp: number) => dayjs(timestamp).format(EDateTimeFormats.TimeMilliseconds);

export function CommonErrorTitleView(props: {
    timestamp?: number;
    traceId?: TraceId;
}): ReactElement {
    return (
        <div className={cnHeader}>
            {props.timestamp && <span title="Timestamp">{getTime(props.timestamp)}</span>}
            {props.timestamp && props.traceId && ' | '}
            {props.traceId && <span title="Trace ID">{props.traceId}</span>}
        </div>
    );
}

export function CommonErrorView(
    props: TWithClassname &
        TWithStyle & {
            message: string | ReactNode;
            timestamp?: number;
            traceId?: TraceId;
        },
): ReactElement {
    return (
        <div className={props.className} style={props.style}>
            <CommonErrorTitleView {...props} />
            <div>{props.message}</div>
        </div>
    );
}
