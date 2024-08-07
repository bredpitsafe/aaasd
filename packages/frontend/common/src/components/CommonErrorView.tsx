import { EDateTimeFormats } from '@common/types';
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

import type { TNotificationProps } from '../modules/notifications/def.ts';
import type { TWithClassname, TWithStyle } from '../types/components';
import { logger } from '../utils/Tracing';
import { cnDescription, cnHeader } from './CommonErrorView.css';

const getTime = (timestamp: number) => dayjs(timestamp).format(EDateTimeFormats.TimeMilliseconds);
type TCommonErrorTitleViewProps = TNotificationProps & {
    count?: number;
};

export function CommonErrorTitleView(props: TCommonErrorTitleViewProps): ReactElement {
    const url = useMemo(() => {
        try {
            return !isNil(props.socketURL) ? new URL(props.socketURL).pathname : undefined;
        } catch {
            logger.error('Incorrect socketURL passed to CommonErrorTitleView', props.socketURL);
            return;
        }
    }, [props.socketURL]);

    return (
        <div className={cnHeader}>
            {/* Only extract socket path to shorten error text, because every socket has same domain as app */}
            {!isNil(url) && <span title="Socket">{url}</span>}
            {url && props.timestamp && ' | '}
            {props.timestamp && <span title="Timestamp">{getTime(props.timestamp)}</span>}
            {props.timestamp && props.traceId && ' | '}
            {props.traceId && <span title="Trace ID">{props.traceId}</span>}
            {props.traceId && props.count && props.count > 1 && ' | '}
            {props.count && props.count > 1 && (
                <span title="Similar messages count">{props.count}</span>
            )}
        </div>
    );
}

export function CommonErrorView(
    props: TWithClassname & TWithStyle & TCommonErrorTitleViewProps,
): ReactElement {
    return (
        <div className={props.className} style={props.style}>
            <CommonErrorTitleView {...props} />
            <div>{props.message}</div>
            {props.description ? (
                <div className={cnDescription}>{props.description}</div>
            ) : undefined}
        </div>
    );
}
