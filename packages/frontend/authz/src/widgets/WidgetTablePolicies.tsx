import { useModule } from '@frontend/common/src/di/react';
import { ETableIds } from '@frontend/common/src/modules/clientTableFilters/data';
import { ETypicalSearchParams } from '@frontend/common/src/modules/router/defs';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useMemo } from 'react';

import { ModuleAuthzRouter } from '../modules/router/module';
import { extractTableFilter } from '../utils/tableFilterUtils';

export function WidgetTablePolicies() {
    const { state$ } = useModule(ModuleAuthzRouter);

    const state = useSyncObservable(state$);
    const urlFilter = useMemo(
        () =>
            extractTableFilter(
                ETableIds.AuthzPolicies,
                state?.route.params[ETypicalSearchParams.TableFilter],
            ),
        [state],
    );

    // const filters = useMemo(() => matchPoliciesFiltersWithGrpcFilters(urlFilter), [urlFilter]);

    return <div>{JSON.stringify(urlFilter)}</div>;
}
