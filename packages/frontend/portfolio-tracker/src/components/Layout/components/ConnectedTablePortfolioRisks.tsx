import { useModule } from '@frontend/common/src/di/react';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { ReactElement } from 'react';

import { ModulePortfolioTrackerObservables } from '../../../modules/observables/module';
import { TablePortfolioRisks } from '../../Tables/TablePortfolioRisks';

export function ConnectedTablePortfolioRisks(props: TWithClassname): null | ReactElement {
    const { currentPortfolioRisks$, currentAssetRecord$, currentBooksRecord$ } = useModule(
        ModulePortfolioTrackerObservables,
    );

    const risks = useSyncObservable(currentPortfolioRisks$);
    const booksRecord = useSyncObservable(currentBooksRecord$);
    const assetsRecord = useSyncObservable(currentAssetRecord$);

    return (
        <TablePortfolioRisks
            className={props.className}
            items={risks}
            booksRecord={booksRecord}
            assetsRecord={assetsRecord}
        />
    );
}
