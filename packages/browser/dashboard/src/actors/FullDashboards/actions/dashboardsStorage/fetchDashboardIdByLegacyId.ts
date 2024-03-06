import { fetchDashboardIdByLegacyIdEnvBox } from '@frontend/common/src/actors/DashboardsStorage/envelope';
import type { TContextRef } from '@frontend/common/src/di';
import { ModuleActor } from '@frontend/common/src/modules/actor';
import type { TComponent } from '@frontend/common/src/types/domain/component';
import type { TStorageDashboardId } from '@frontend/common/src/types/domain/dashboardsStorage';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import {
    ExtractValueDescriptor,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import type { Observable } from 'rxjs';
import { map, startWith, switchMap } from 'rxjs/operators';

import { ModuleServiceStage } from '../../../../modules/serviceStage';
import type { TCommonFailDesc } from '../../types';
import { convertErrorToCommonFailDesc, logError } from './utils';

const createFail = FailFactory('FetchServerDashboardId');
const descFactory = ValueDescriptorFactory<
    TStorageDashboardId,
    TCommonFailDesc<'FetchServerDashboardId'>
>();

export type TFetchServerDashboardIdReturnType = ExtractValueDescriptor<typeof descFactory>;

export function fetchDashboardIdByLegacyId(
    ctx: TContextRef,
    legacyId: TComponent['id'],
): Observable<TFetchServerDashboardIdReturnType> {
    const actor = ModuleActor(ctx);

    const traceId = generateTraceId();

    const { currentStage$ } = ModuleServiceStage(ctx);
    return currentStage$.pipe(
        switchMap((stage) =>
            fetchDashboardIdByLegacyIdEnvBox
                .request(actor, {
                    url: stage.url,
                    legacyId,
                    traceId,
                })
                .pipe(
                    map((storageDashboardId) => descFactory.sync(storageDashboardId, null)),
                    logError('fetchServerDashboardId', 'Failed to fetch dashboard ID'),
                    convertErrorToCommonFailDesc(createFail),
                    startWith(descFactory.unsc(null)),
                ),
        ),
    );
}
