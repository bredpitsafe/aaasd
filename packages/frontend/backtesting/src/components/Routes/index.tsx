import {
    BacktestingProps,
    EBacktestingSelectors,
} from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { useModule } from '@frontend/common/src/di/react';
import { ReactElement, useMemo } from 'react';
import { useObservable } from 'react-use';

import { EBacktestingRoute } from '../../defs/router';
import { ModuleBacktestingRouter } from '../../modules/router/module';
import { WidgetModalSettings } from '../../widgets/WidgetModalSettings';
import { Page } from '../Page/view';

export const Routes = (): ReactElement => {
    const { state$ } = useModule(ModuleBacktestingRouter);
    const routeState = useObservable(state$);

    const comp = useMemo(() => {
        if (routeState === undefined) {
            return <LoadingOverlay text="Loading router..." />;
        }

        const { route } = routeState;

        switch (route.name) {
            case EBacktestingRoute.Default:
                return <WidgetModalSettings closable={true} />;
            default: {
                return <Page />;
            }
        }
    }, [routeState]);

    return (
        <div
            style={{ width: '100%', height: '100%' }}
            {...BacktestingProps[EBacktestingSelectors.App]}
        >
            {comp}
        </div>
    );
};
