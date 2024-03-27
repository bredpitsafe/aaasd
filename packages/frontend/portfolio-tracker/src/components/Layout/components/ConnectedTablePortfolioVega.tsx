import { useModule } from '@frontend/common/src/di/react';
import { TWithClassname } from '@frontend/common/src/types/components';
import { TAssetId } from '@frontend/common/src/types/domain/asset';
import {
    EGreekByPeriodName,
    GREEK_BY_PERIOD_NAMES,
    TPortfolioRisksId,
} from '@frontend/common/src/types/domain/portfolioTraсker';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { ReactElement, useMemo } from 'react';

import { ModulePortfolioTrackerObservables } from '../../../modules/observables/module';
import { TablePortfolioVega, TTablePortfolioVegaItem } from '../../Tables/TablePortfolioVega';

export function ConnectedTablePortfolioVega(props: TWithClassname): null | ReactElement {
    const { currentPortfolioRisks$, currentAssetRecord$ } = useModule(
        ModulePortfolioTrackerObservables,
    );

    const assetsRecord = useSyncObservable(currentAssetRecord$);
    const risks = useSyncObservable(currentPortfolioRisks$);
    const items = useMemo(() => {
        return risks
            ?.map((risk): TTablePortfolioVegaItem[] => {
                return risk.vegas.map((vega): TTablePortfolioVegaItem => {
                    return {
                        id: getVegaId(risk.id, vega.baseAssetId),
                        assetId: risk.assetId,
                        baseAssetId: vega.baseAssetId,
                        total: vega.value.reduce((acc, value) => acc + value, 0),
                        values: vega.value.reduce(
                            (acc, value, index) => {
                                acc[GREEK_BY_PERIOD_NAMES[index]] = value;
                                return acc;
                            },
                            {} as Record<EGreekByPeriodName, number>,
                        ),
                    };
                });
            }, [])
            .flat();
    }, [risks]);

    return (
        <TablePortfolioVega className={props.className} items={items} assetsRecord={assetsRecord} />
    );
}

function getVegaId(riskId: TPortfolioRisksId, assetId: TAssetId): string {
    return `vega:${riskId}-${assetId}`;
}
