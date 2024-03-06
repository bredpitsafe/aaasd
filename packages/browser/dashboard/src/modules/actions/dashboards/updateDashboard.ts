import type { MessageType } from '@frontend/common/src/components/Message';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { assertNever } from '@frontend/common/src/utils/assert';
import { switchMapDesc, tapDesc } from '@frontend/common/src/utils/Rx/desc';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import type { Observable } from 'rxjs';
import { EMPTY, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { updateDashboardDraftEnvBox } from '../../../actors/FullDashboards/envelope';
import type { TFullDashboard } from '../../../types/fullDashboard';
import {
    getDashboardItemKeyFromDashboard,
    getUniqueDashboardItemKey,
} from '../../../utils/dashboards';
import { tapRuntimeError } from '../../utils';

export function updateDashboard(
    ctx: TContextRef,
    openedWindows: Set<string>,
    traceId: TraceId,
    fullDashboard: TFullDashboard,
): Observable<boolean> {
    const actor = ModuleActor(ctx);

    const { loading } = ModuleMessages(ctx);
    const { error } = ModuleNotifications(ctx);

    let closeLoading: MessageType | undefined = undefined;

    return updateDashboardDraftEnvBox.requestStream(actor, { traceId, fullDashboard }).pipe(
        tapRuntimeError(error),
        tapDesc({
            idle: () => {
                const key = getUniqueDashboardItemKey(
                    getDashboardItemKeyFromDashboard(fullDashboard),
                );

                if (openedWindows.has(key)) {
                    return;
                }

                openedWindows.add(key);

                closeLoading = loading('Updating Dashboard Draft...', undefined, () =>
                    openedWindows.delete(key),
                );
            },
            fail: ({ code, meta }) => {
                switch (code) {
                    case '[UpdateDashboardDraft]: AUTHORIZATION':
                    case '[UpdateDashboardDraft]: NOT_FOUND':
                    case '[UpdateDashboardDraft]: SERVER_NOT_PROCESSED':
                        error({
                            message: 'Failed to update Dashboard Draft',
                            description: meta.message,
                            traceId: meta.traceId,
                        });
                        break;
                    case '[UpdateDashboardDraft]: UNKNOWN':
                        error({
                            message: 'UI Error',
                            description: meta,
                        });
                        break;
                    default:
                        assertNever(code);
                }
            },
        }),
        switchMapDesc({
            idle: () => EMPTY,
            unsynchronized: () => EMPTY,
            synchronized: () => of(true),
            fail: () => of(false),
        }),
        finalize(() => closeLoading?.()),
    );
}
