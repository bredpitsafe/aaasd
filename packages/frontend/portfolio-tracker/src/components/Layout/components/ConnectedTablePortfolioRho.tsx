import { useModule } from '@frontend/common/src/di/react';
import { TWithClassname } from '@frontend/common/src/types/components';
import {
    EGreekByPeriodName,
    GREEK_BY_PERIOD_NAMES,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { ReactElement, useMemo } from 'react';

import { ModulePortfolioTrackerObservables } from '../../../modules/observables/module';
import { TablePortfolioRho, TTablePortfolioRhoItem } from '../../Tables/TablePortfolioRho';

export function ConnectedTablePortfolioRho(props: TWithClassname): null | ReactElement {
    const { currentPortfolioRisks$, currentAssetRecord$ } = useModule(
        ModulePortfolioTrackerObservables,
    );

    const assetsRecord = useSyncObservable(currentAssetRecord$);
    const risks = useSyncObservable(currentPortfolioRisks$);
    const rhos = useMemo(() => {
        return risks?.map((risk): TTablePortfolioRhoItem => {
            return {
                id: risk.id,
                assetId: risk.assetId,
                total: risk.rhos.reduce((acc, value) => acc + value, 0),
                values: risk.rhos.reduce(
                    (acc, value, index) => {
                        acc[GREEK_BY_PERIOD_NAMES[index]] = value;
                        return acc;
                    },
                    {} as Record<EGreekByPeriodName, number>,
                ),
            };
        }, []);
    }, [risks]);

    return (
        <TablePortfolioRho className={props.className} items={rhos} assetsRecord={assetsRecord} />
    );
}
