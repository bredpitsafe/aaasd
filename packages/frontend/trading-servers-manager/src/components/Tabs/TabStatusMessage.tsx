import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import {
    EStatusMessagesTabSelectors,
    StatusMessagesTabProps,
} from '@frontend/common/e2e/selectors/trading-servers-manager/components/status-messages-tab/status-messages.tab.selectors';
import { Divider } from '@frontend/common/src/components/Divider';
import { Error } from '@frontend/common/src/components/Error/view';
import type { TStatusMessage } from '@frontend/common/src/components/hooks/components/useStatusMessageHistory';
import { StatusMessage } from '@frontend/common/src/components/StatusMessage';
import type { Key, ReactElement } from 'react';

import { cnStatusTabContent, cnStatusTabTimestamp } from './styles.css';

type TTabStatusMessageProps = {
    statusMessages: TStatusMessage[];
    tabKey: Key;
    timeZone: TimeZone;
};

export function TabStatusMessage({
    statusMessages,
    timeZone,
}: TTabStatusMessageProps): ReactElement | null {
    return (
        <div
            className={cnStatusTabContent}
            {...StatusMessagesTabProps[EStatusMessagesTabSelectors.StatusMessagesBody]}
        >
            {statusMessages.length ? (
                statusMessages
                    .map(({ message, timestamp }, index) => (
                        <div key={index}>
                            <span
                                {...StatusMessagesTabProps[
                                    EStatusMessagesTabSelectors.StatusMessagesText
                                ]}
                                className={cnStatusTabTimestamp}
                            >
                                {toDayjsWithTimezone(timestamp, timeZone).format(
                                    EDateTimeFormats.DateTime,
                                )}
                            </span>
                            <StatusMessage statusMessage={message} />
                            <Divider />
                        </div>
                    ))
                    .reverse()
            ) : (
                <Error status="info" title="No status messages yet" />
            )}
        </div>
    );
}
