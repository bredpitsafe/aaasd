import { createDashboardEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type {
    EStorageDashboardKind,
    EStorageDashboardStatus,
    TStorageDashboardConfig,
    TStorageDashboardId,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { FailFactory } from '@frontend/common/src/types/Fail';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { first, map, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import type { TCommonFailDesc } from '../../types';
import { convertErrorToCommonFailDesc, logError } from './utils';

export type TCreateDashboardEnvelopeProps = {
    name: TStorageDashboardName;
    config: TStorageDashboardConfig;
    kind?: EStorageDashboardKind;
    status?: EStorageDashboardStatus;
};

const createFail = FailFactory('CreateServerDashboard');
const descFactory = ValueDescriptorFactory<
    TStorageDashboardId,
    TCommonFailDesc<'CreateServerDashboard'>
>();

export type TCreateServerDashboardReturnType = ExtractValueDescriptor<typeof descFactory>;

export function createDashboard(
    ctx: TContextRef,
    traceId: TraceId,
    name: TStorageDashboardName,
    config: TStorageDashboardConfig,
    kind?: EStorageDashboardKind,
    status?: EStorageDashboardStatus,
): Observable<TCreateServerDashboardReturnType> {
    const actor = ModuleActor(ctx);

    const { currentStage$ } = ModuleServiceStage(ctx);
    return currentStage$.pipe(
        first(),
        switchMap((stage) =>
            createDashboardEnvBox
                .request(actor, {
                    url: stage.url,
                    name,
                    config,
                    kind,
                    status,
                    traceId,
                })
                .pipe(
                    map((storageDashboardId) => descFactory.sync(storageDashboardId, null)),
                    logError('createServerDashboard', 'Failed to create dashboard'),
                    convertErrorToCommonFailDesc(createFail),
                    startWith(descFactory.unsc(null)),
                ),
        ),
    );
}
