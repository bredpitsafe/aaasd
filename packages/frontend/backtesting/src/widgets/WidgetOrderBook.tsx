import { ConnectedCommonOrderBook } from '@frontend/common/src/components/Pages/ConnectedCommonOrderBook';
import { useUtcTimeZoneInfo } from '@frontend/common/src/components/Settings/hooks/useUtcTimeZoneInfo';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { ModuleSubscribeToCurrentBacktestingRunId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRunId';
import { ModuleSubscribeToCurrentSocketInstruments } from '../modules/actions/ModuleSubscribeToCurrentSocketInstruments';

export function WidgetOrderBook({ className }: TWithClassname) {
    const { currentSocketName$, currentSocketUrl$ } = useModule(ModuleSocketPage);
    const subscribeToCurrentBacktestingRunId = useModule(ModuleSubscribeToCurrentBacktestingRunId);
    const subscribeToCurrentSocketInstruments = useModule(
        ModuleSubscribeToCurrentSocketInstruments,
    );

    const socketUrl = useSyncObservable(currentSocketUrl$);
    const socketName = useSyncObservable(currentSocketName$);
    const runId = useSyncObservable(subscribeToCurrentBacktestingRunId());
    const instruments = useSyncObservable(subscribeToCurrentSocketInstruments());

    const storageKey = useMemo(
        () =>
            isNil(socketName)
                ? undefined
                : `ORDER_BOOK_BACKTESTING_FILTERS_STATE_{server:[${socketName}]}`,
        [socketName],
    );

    const { timeZone } = useUtcTimeZoneInfo();

    return isNil(socketUrl) || isNil(storageKey) ? null : (
        <ConnectedCommonOrderBook
            className={className}
            socketUrl={socketUrl}
            instruments={instruments}
            storageKey={storageKey}
            btRunNo={runId}
            timeZone={timeZone}
        />
    );
}
