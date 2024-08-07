import { useModule } from '@frontend/common/src/di/react';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { isArray } from 'lodash-es';
import { memo } from 'react';

import { QueriesMenu } from '../../components/QueriesMenu';
import { ModuleRequest } from '../../modules/request';
import { ModuleRequestQuery } from '../../modules/requestQuery';

export const SavedQueries = memo((props: TWithClassname) => {
    const { getManuallySavedQueries, deleteRequestQuery } = useModule(ModuleRequestQuery);
    const { setQuery } = useModule(ModuleRequest);

    const queries = useSyncObservable(getManuallySavedQueries());

    if (!isArray(queries)) return null;

    return (
        <QueriesMenu
            className={props.className}
            queries={queries}
            onSelect={(v) => void setQuery(v.query)}
            onDelete={(v) => deleteRequestQuery(v.id)}
        />
    );
});
