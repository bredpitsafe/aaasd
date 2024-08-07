import { TimeZoneList } from '@common/types';
import type { TWithTest } from '@frontend/common/e2e';
import { pickTestProps } from '@frontend/common/e2e';
import { useModule } from '@frontend/common/src/di/react';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { TableTrades } from '@frontend/herodotus';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';
import { filter, map } from 'rxjs/operators';

import { getTradesRouteParams, ModuleHerodotusTradesRouter } from '../modules/router';
import { ModuleHerodotusTradesState } from '../modules/state';
import { ModuleHerodotusTrades } from '../modules/trades';
import { ETradesRoutes } from '../types/router';
import { cnContainer } from './Root.css';

export function Root(props: TWithTest): ReactElement {
    const { taskId$ } = useModule(ModuleHerodotusTradesState);
    const { state$ } = useModule(ModuleHerodotusTradesRouter);
    const { getTrades$ } = useModule(ModuleHerodotusTrades);
    const timeZone$ = useMemo(
        () =>
            state$.pipe(
                filter((state) => state?.route?.name === ETradesRoutes.Trades),
                map((state) => getTradesRouteParams(state.route.params)),
                map((params) => params.timeZone),
            ),
        [state$],
    );

    const tradeGroupId = useSyncObservable(taskId$);
    const trades = useSyncObservable(
        useMemo(
            () => (isNil(tradeGroupId) ? EMPTY : getTrades$(tradeGroupId)),
            [getTrades$, tradeGroupId],
        ),
    );
    const timeZone = useSyncObservable(timeZone$, TimeZoneList.UTC);

    return (
        <div className={cnContainer} {...pickTestProps(props)}>
            <TableTrades trades={trades} timeZone={timeZone} />
        </div>
    );
}
