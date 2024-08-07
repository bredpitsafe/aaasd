import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { isArray } from 'lodash-es';
import { memo } from 'react';

import { QueriesMenu } from '../../components/QueriesMenu';
import { ModuleRequest } from '../../modules/request';
import { ModuleRequestQuery } from '../../modules/requestQuery';
import { cnRoot } from './style.css';

export const RequestHistory = memo((props: TWithClassname) => {
    const { subscribeToRequestQueries, deleteRequestQuery, clearHistory } =
        useModule(ModuleRequestQuery);
    const { setQuery } = useModule(ModuleRequest);

    const requestState = useSyncObservable(subscribeToRequestQueries());

    if (!isArray(requestState)) return null;

    return (
        <div
            {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.HistoryTab]}
            className={cnRoot}
        >
            <QueriesMenu
                className={props.className}
                queries={requestState}
                onSelect={(v) => setQuery(v.query)}
                onDelete={(v) => deleteRequestQuery(v.id, { deleteFromHistory: true })}
            />
            <Button
                {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.ClearUnsavedButton]}
                type="primary"
                onClick={() => void clearHistory()}
            >
                Clear Unsaved
            </Button>
        </div>
    );
});
