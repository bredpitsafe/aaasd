import type { TContextRef } from '@frontend/common/src/di';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type {
    EStorageDashboardKind,
    EStorageDashboardStatus,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { assertNever } from '@frontend/common/src/utils/assert';
import { switchMapDesc, tapDesc } from '@frontend/common/src/utils/Rx/desc';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import type { Observable } from 'rxjs';
import { EMPTY, of } from 'rxjs';
import { finalize } from 'rxjs/operators';

import { createDashboardEnvBox } from '../../../actors/FullDashboards/envelope';
import type { TDashboard } from '../../../types/dashboard';
import type { TStorageDashboardItemKey } from '../../../types/fullDashboard';
import {
    convertDashboardToExportableDashboardEditor,
    convertDashboardToXml,
} from '../../../utils/dashboards/converters';
import { tapRuntimeError } from '../../utils';

export function createDashboard(
    ctx: TContextRef,
    traceId: TraceId,
    dashboard: TDashboard,
    kind?: EStorageDashboardKind,
    status?: EStorageDashboardStatus,
): Observable<TStorageDashboardItemKey> {
    const actor = ModuleActor(ctx);

    const { loading, success } = ModuleMessages(ctx);
    const { error } = ModuleNotifications(ctx);

    const closeLoading = loading(`Creating Dashboard "${name}"...`);

    return createDashboardEnvBox
        .requestStream(actor, {
            traceId,
            props: {
                name: dashboard.name,
                config: convertDashboardToXml(
                    convertDashboardToExportableDashboardEditor(dashboard),
                ),
                kind,
                status,
            },
        })
        .pipe(
            tapRuntimeError(error),
            tapDesc({
                synchronized: () => void success(`Dashboard "${dashboard.name}" was created`),
                fail: ({ code, meta }) => {
                    switch (code) {
                        case '[CreateServerDashboard]: UNKNOWN':
                            error({
                                message: 'UI Error',
                                description: meta,
                            });
                            break;
                        case '[CreateServerDashboard]: SERVER_NOT_PROCESSED':
                            error({
                                message: 'Failed to create Dashboard',
                                description: meta.message,
                                traceId: meta.traceId,
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
                synchronized: (storageId) => of({ storageId }),
                fail: ({ code, meta }): Observable<never> => {
                    switch (code) {
                        case '[CreateServerDashboard]: UNKNOWN':
                            throw new Error(meta);
                        case '[CreateServerDashboard]: SERVER_NOT_PROCESSED':
                            throw new Error(meta.message);
                        default:
                            assertNever(code);
                    }
                },
            }),
            finalize(closeLoading),
        );
}
