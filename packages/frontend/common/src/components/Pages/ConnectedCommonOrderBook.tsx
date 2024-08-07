import type { TimeZone } from '@common/types';
import { memo } from 'react';

import { useModule } from '../../di/react';
import { ENotificationsType } from '../../modules/notifications/def';
import { ModuleNotifications } from '../../modules/notifications/module';
import type { TWithClassname } from '../../types/components';
import type { TBacktestingRun } from '../../types/domain/backtestings';
import type { TInstrument } from '../../types/domain/instrument';
import type { TSocketURL } from '../../types/domain/sockets';
import { useFunction } from '../../utils/React/useFunction';
import { useLocalStorage } from '../../utils/React/useLocalStorage';
import { useSyncState } from '../../utils/React/useSyncState';
import type { TOrderBookFormFilter } from '../OrderBook/defs';
import { useOrderBookData } from '../OrderBook/hooks/useOrderBookData';
import { OrderBookView } from '../OrderBook/OrderBookView';

export type TConnectedCommonOrderBookProps = TWithClassname & {
    socketUrl: TSocketURL;
    instruments?: TInstrument[];
    storageKey?: string;
    timeZone: TimeZone;
    btRunNo?: TBacktestingRun['btRunNo'];
};

export const ConnectedCommonOrderBook = memo(
    ({
        className,
        socketUrl,
        instruments,
        storageKey,
        btRunNo,
        timeZone,
    }: TConnectedCommonOrderBookProps) => {
        const { error } = useModule(ModuleNotifications);

        const showError = useFunction((message) =>
            error({
                type: ENotificationsType.Error,
                message: message,
            }),
        );

        const [filter, setFilter] = useLocalStorage<TOrderBookFormFilter>(storageKey);
        const [currentStep, setCurrentStep] = useSyncState(0, [socketUrl, filter]);

        const data = useOrderBookData(socketUrl, filter, currentStep, btRunNo);

        return (
            <OrderBookView
                className={className}
                filter={filter}
                data={data}
                timeZone={timeZone}
                instruments={instruments}
                currentStep={currentStep}
                onApplyFilter={setFilter}
                onChangeStep={setCurrentStep}
                onError={showError}
            />
        );
    },
);
