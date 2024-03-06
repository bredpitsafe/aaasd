import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { TStorageDashboardName } from '@frontend/common/src/types/domain/dashboardsStorage';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError';
import { logErrorAndFail } from '@frontend/common/src/utils/Rx/log';
import { ModuleNotifyErrorAndFail } from '@frontend/common/src/utils/Rx/ModuleNotify';
import { mergeMapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { convertErrToGrpcFail } from '@frontend/common/src/utils/ValueDescriptor/Fails';
import { TGrpcFail } from '@frontend/common/src/utils/ValueDescriptor/types';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { EMPTY, of } from 'rxjs';

import { renameDashboardEnvBox } from '../../../actors/FullDashboards/envelope';
import type { TDashboardItemKey } from '../../../types/fullDashboard';

export function renameDashboard(
    ctx: TContextRef,
    dashboardItemKey: TDashboardItemKey,
    dashboardName: TStorageDashboardName,
    traceId: TraceId,
): Observable<boolean> {
    const actor = ModuleActor(ctx);
    const notifyErrorAndFail = ModuleNotifyErrorAndFail(ctx);
    const onFail = ({ code, meta }: TGrpcFail) => {
        switch (code) {
            case EGrpcErrorCode.PERMISSION_DENIED:
            case EGrpcErrorCode.NOT_FOUND:
                return {
                    message: 'Failed to rename Dashboard',
                    description: meta.message,
                    traceId: traceId,
                };
            case EGrpcErrorCode.UNKNOWN:
            default:
                return {
                    message: 'UI Error',
                    description: meta.message,
                    traceId: traceId,
                };
        }
    };

    return renameDashboardEnvBox
        .requestStream(actor, {
            traceId,
            props: {
                dashboardItemKey,
                name: dashboardName,
            },
        })
        .pipe(
            logErrorAndFail(),
            notifyErrorAndFail((err) => onFail(convertErrToGrpcFail(err)), onFail),
            mergeMapValueDescriptor({
                unsynced: ({ fail }) => (isNil(fail) ? EMPTY : of(false)),
                synced: () => of(true),
            }),
        );
}
