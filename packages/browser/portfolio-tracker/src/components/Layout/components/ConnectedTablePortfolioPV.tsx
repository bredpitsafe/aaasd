import { useModule } from '@frontend/common/src/di/react';
import { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { ReactElement } from 'react';

import { ModulePortfolioTrackerObservables } from '../../../modules/observables/module';
import { TablePortfolioPV } from '../../Tables/TablePortfolioPV';

export function ConnectedTablePortfolioPV(props: TWithClassname): ReactElement {
    const { currentPortfolioRisksPV$ } = useModule(ModulePortfolioTrackerObservables);

    const data = useSyncObservable(currentPortfolioRisksPV$);

    return (
        <TablePortfolioPV
            className={props.className}
            pv={data?.pv}
            theta={data?.theta}
            thetaFx={data?.thetaFx}
            portfolioPv={data?.portfolioPV}
            skewReserves={data?.skewReserves}
        />
    );
}
