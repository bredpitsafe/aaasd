import { generateTraceId } from '@common/utils';
import { ConnectedCommonOrderBook } from '@frontend/common/src/components/Pages/ConnectedCommonOrderBook';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleSubscribeToInstrumentsOnCurrentStage } from '@frontend/common/src/modules/actions/dictionaries/ModuleSubscribeToInstrumentsOnCurrentStage.ts';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';

import { ModuleSubscribeToCurrentBacktestingRunId } from '../modules/actions/ModuleSubscribeToCurrentBacktestingRunId';

export function WidgetOrderBook({ className }: TWithClassname) {
    const { currentSocketName$, currentSocketUrl$ } = useModule(ModuleSocketPage);
    const subscribeToCurrentBacktestingRunId = useModule(ModuleSubscribeToCurrentBacktestingRunId);
    const subscribeToCurrentSocketInstruments = useModule(
        ModuleSubscribeToInstrumentsOnCurrentStage,
    );

    const socketUrl = useSyncObservable(currentSocketUrl$);
    const socketName = useSyncObservable(currentSocketName$);
    const runId = useSyncObservable(subscribeToCurrentBacktestingRunId());
    const instruments = useNotifiedValueDescriptorObservable(
        subscribeToCurrentSocketInstruments(undefined, { traceId: generateTraceId() }),
    );

    const storageKey = useMemo(
        () =>
            isNil(socketName)
                ? undefined
                : `ORDER_BOOK_BACKTESTING_FILTERS_STATE_{server:[${socketName}]}`,
        [socketName],
    );

    const [{ timeZone }] = useTimeZoneInfoSettings();

    return isNil(socketUrl) || isNil(storageKey) ? null : (
        <ConnectedCommonOrderBook
            className={className}
            socketUrl={socketUrl}
            instruments={instruments.value ?? undefined}
            storageKey={storageKey}
            btRunNo={runId}
            timeZone={timeZone}
        />
    );
}
