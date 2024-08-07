import type { TimeZone } from '@common/types';
import type { TStatusMessage } from '@frontend/common/src/components/hooks/components/useStatusMessageHistory';
import type { ReactElement } from 'react';

import { ETabName } from '../../../PageComponent/PageComponent';
import { TabStatusMessage } from '../../../Tabs/TabStatusMessage';

type TGateStatusMessagesProps = {
    statusMessageHistory: TStatusMessage[];
    timeZone: TimeZone;
};

export function GateStatusMessages({
    statusMessageHistory,
    timeZone,
}: TGateStatusMessagesProps): ReactElement {
    return (
        <TabStatusMessage
            tabKey={ETabName.status}
            statusMessages={statusMessageHistory}
            timeZone={timeZone}
        />
    );
}
