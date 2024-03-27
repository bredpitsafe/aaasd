import { useModule } from '@frontend/common/src/di/react';
import { TWithClassname } from '@frontend/common/src/types/components';
import { TAssetId } from '@frontend/common/src/types/domain/asset';
import { TPortfolioRisks } from '@frontend/common/src/types/domain/portfolioTraсker';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { uniq } from 'lodash-es';
import { ReactElement, useMemo } from 'react';

import { ModulePortfolioTrackerObservables } from '../../../modules/observables/module';
import { TablePortfolioGamma, TTablePortfolioGammaItem } from '../../Tables/TablePortfolioGamma';

export function ConnectedTablePortfolioGamma(props: TWithClassname): null | ReactElement {
    const { currentPortfolioRisks$, currentAssetRecord$, currentBooksRecord$ } = useModule(
        ModulePortfolioTrackerObservables,
    );

    const assetsRecord = useSyncObservable(currentAssetRecord$);
    const booksRecord = useSyncObservable(currentBooksRecord$);
    const risks = useSyncObservable(currentPortfolioRisks$);
    const { items, assets } = useMemo(() => {
        return {
            items: risks?.map(getItem),
            assets: uniq(risks?.map((risk) => risk.assetId)) ?? EMPTY_ARRAY,
        };
    }, [risks]);

    return (
        <TablePortfolioGamma
            className={props.className}
            items={items}
            columnsAssetIds={assets}
            assetsRecord={assetsRecord}
            booksRecord={booksRecord}
        />
    );
}

function getItem(risk: TPortfolioRisks): TTablePortfolioGammaItem {
    return {
        id: risk.id,
        assetId: risk.assetId,
        bookId: risk.bookId,
        values: risk.gammas.reduce(
            (acc, gamma) => {
                acc[gamma.baseAssetId] = gamma.value;
                return acc;
            },
            {} as Record<TAssetId, number>,
        ),
    };
}
