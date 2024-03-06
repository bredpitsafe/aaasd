import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { ReactElement } from 'react';

import { ModulePortfolioTrackerObservables } from '../../../modules/observables/module';
import { TablePortfolioTrades } from '../../Tables/TablePortfolioTrades';

export function ConnectedTablePortfolioTrades(props: TWithClassname): null | ReactElement {
    const {
        currentPortfolioTrades$,
        currentAssetRecord$,
        currentInstrumentRecord$,
        currentBooksRecord$,
    } = useModule(ModulePortfolioTrackerObservables);

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.PortfolioTracker);

    const booksRecord = useSyncObservable(currentBooksRecord$);
    const assetsRecord = useSyncObservable(currentAssetRecord$);
    const instrumentsRecord = useSyncObservable(currentInstrumentRecord$);
    const trades = useSyncObservable(currentPortfolioTrades$);

    return (
        <TablePortfolioTrades
            className={props.className}
            items={trades}
            timeZone={timeZone}
            booksRecord={booksRecord}
            assetsRecord={assetsRecord}
            instrumentsRecord={instrumentsRecord}
        />
    );
}
