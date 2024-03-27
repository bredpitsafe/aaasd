import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { useModule } from '@frontend/common/src/di/react';
import { EApplicationName } from '@frontend/common/src/types/app';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { ReactElement } from 'react';

import { ModulePortfolioTrackerObservables } from '../../../modules/observables/module';
import { TablePortfolioPositions } from '../../Tables/TablePortfolioPositions';

export function ConnectedTablePortfolioPositions(props: TWithClassname): null | ReactElement {
    const { currentPortfolioPositions$, currentInstrumentRecord$, currentBooksRecord$ } = useModule(
        ModulePortfolioTrackerObservables,
    );

    const [{ timeZone }] = useTimeZoneInfoSettings(EApplicationName.PortfolioTracker);

    const positions = useSyncObservable(currentPortfolioPositions$);
    const booksRecord = useSyncObservable(currentBooksRecord$);
    const instrumentRecord = useSyncObservable(currentInstrumentRecord$);

    return (
        <TablePortfolioPositions
            className={props.className}
            items={positions}
            timeZone={timeZone}
            booksRecord={booksRecord}
            instrumentsRecord={instrumentRecord}
        />
    );
}
