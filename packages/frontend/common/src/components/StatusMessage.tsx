import { isEmpty } from 'lodash-es';
import type { ReactElement } from 'react';
import { useCallback, useMemo } from 'react';

import type { TWithClassname } from '../types/components';
import type { TStatusMessage } from './hooks/components/useStatusMessageHistory';
import { List } from './List';
import { cnItem } from './StatusMessage.css';

export type TStatusMessageProps = TWithClassname & {
    statusMessage: TStatusMessage['message'];
    timestamp?: TStatusMessage['timestamp'];
};

const STATUS_MESSAGE_SEPARATOR = ';';

export function StatusMessage(props: TStatusMessageProps): ReactElement | null {
    const { statusMessage } = props;

    const message = useMemo(() => {
        if (!statusMessage) {
            return;
        }

        return statusMessage
            .split(STATUS_MESSAGE_SEPARATOR)
            .filter((message) => !isEmpty(message.trim()));
    }, [statusMessage]);

    const renderListItem = useCallback(
        (item: string) => <List.Item className={cnItem}>{item}</List.Item>,
        [],
    );

    if (!message) {
        return null;
    }

    return <List className={props.className} dataSource={message} renderItem={renderListItem} />;
}
