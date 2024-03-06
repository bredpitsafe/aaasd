import type { TContextRef } from '@frontend/common/src/di';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleBaseActions } from '@frontend/common/src/modules/actions';
import type {
    TStorageDashboardConfig,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { getRight, isLeft } from '@frontend/common/src/types/Either';
import { assertNever } from '@frontend/common/src/utils/assert';
import { base64ToString, TBase64 } from '@frontend/common/src/utils/base64';
import { EDataType } from '@frontend/common/src/utils/dataFormat';
import {
    convertValueDescriptorObservableToPromise,
    convertValueDescriptorObservableToPromise2,
} from '@frontend/common/src/utils/Rx/convertValueDescriptorObservableToPromise';
import type { TraceId } from '@frontend/common/src/utils/traceId';
import { logger } from '@frontend/common/src/utils/Tracing';
import { tryDo } from '@frontend/common/src/utils/tryDo';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { firstValueFrom } from 'rxjs';
import { filter } from 'rxjs/operators';

import type { TDashboard } from '../../../types/dashboard';
import type { TImportableDashboard } from '../../../types/dashboard/importable';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { EOpenType } from '../../../types/router';
import { getDashboardItemKeyFromDashboard, unifyIds } from '../../../utils/dashboards';
import {
    convertImportableXmlDashboardToDashboard,
    convertXMLToDashboard,
    validateFullDashboardJsonStructure,
} from '../../../utils/dashboards/converters';
import { ConvertError } from '../../../utils/dashboards/errors';
import { ModuleUI } from '../../ui/module';
import { ModuleDashboardsStorage } from '../fullDashboards';
import { ModuleGetDashboardValueDescriptor } from '../fullDashboards/ModuleGetDashboardValueDescriptor';
import { ModuleDashboardActions } from '../index';

export async function importDashboard(
    ctx: TContextRef,
    traceId: TraceId,
    type: EDataType,
    config: string,
    confirmAdd?: boolean,
): Promise<boolean> {
    if (type === EDataType.XML) {
        return importFullDashboardFromXmlString(
            ctx,
            traceId,
            config as TStorageDashboardConfig,
            confirmAdd,
        );
    }

    if (type === EDataType.JSON) {
        return importFullDashboardFromJsonString(ctx, traceId, config, confirmAdd);
    }

    if (type === EDataType.Base64) {
        return importFullDashboardFromBase64(
            ctx,
            traceId,
            config as TBase64<TStorageDashboardConfig>,
            confirmAdd,
        );
    }

    assertNever(type);
}

function importFullDashboardFromBase64(
    ctx: TContextRef,
    traceId: TraceId,
    hash: TBase64<string>,
    confirmAdd?: boolean,
): Promise<boolean> {
    const either = tryDo(() => base64ToString(hash));

    if (isLeft(either)) {
        throw new Error('Could not parse dashboard base64');
    } else {
        return importFullDashboardFromJsonString(ctx, traceId, getRight(either), confirmAdd);
    }
}

async function importFullDashboardFromJsonString(
    ctx: TContextRef,
    traceId: TraceId,
    config: string,
    confirmAdd?: boolean,
): Promise<boolean> {
    const either = tryDo(() => JSON.parse(config) as TImportableDashboard);

    if (isLeft(either)) {
        throw new Error('Could not parse dashboard json');
    } else {
        const json = getRight(either);
        const validationResult = await validateFullDashboardJsonStructure(json);

        if (validationResult !== true) {
            throw new ConvertError('Incorrect Dashboard JSON', validationResult);
        }

        const dashboard = convertImportableXmlDashboardToDashboard(json);

        return importFullDashboardFromJson(ctx, traceId, unifyIds(dashboard), confirmAdd);
    }
}

async function importFullDashboardFromXmlString(
    ctx: TContextRef,
    traceId: TraceId,
    config: TStorageDashboardConfig,
    confirmAdd?: boolean,
): Promise<boolean> {
    const dashboard = await convertXMLToDashboard(config);

    return importFullDashboardFromJson(ctx, traceId, unifyIds(dashboard), confirmAdd);
}

async function importFullDashboardFromJson(
    ctx: TContextRef,
    traceId: TraceId,
    dashboard: TDashboard,
    confirmAdd?: boolean,
): Promise<boolean> {
    const { show } = ModuleModals(ctx);
    const { dashboardList$ } = ModuleDashboardsStorage(ctx);
    const { currentDashboardItemKey$ } = ModuleUI(ctx);
    const { updateDashboard, createDashboard, navigateByDashboardItemKey } =
        ModuleDashboardActions(ctx);
    const { showError } = ModuleBaseActions(ctx);
    const getDashboard$ = ModuleGetDashboardValueDescriptor(ctx);

    const currentDashboardItemKey = await firstValueFrom(currentDashboardItemKey$);

    try {
        const dashboardItems = await convertValueDescriptorObservableToPromise(dashboardList$);

        return new Promise<boolean>(async (resolve) => {
            if (confirmAdd !== true) {
                await resolveDashboard(undefined, dashboard.name);
            } else {
                const { SelectDashboardNameDialog } = await import(
                    '../../../components/modals/SelectDashboardNameDialog'
                );

                const modal = show(
                    <SelectDashboardNameDialog
                        title="Add dashboard"
                        name={dashboard.name}
                        dashboardItems={dashboardItems}
                        allowToChooseNewTab={!isNil(currentDashboardItemKey)}
                        onSet={cbSet}
                        onCancel={cbCancel}
                    />,
                );

                async function cbSet(
                    id: TDashboardItemKey | undefined,
                    name: TStorageDashboardName,
                    openType: EOpenType,
                ) {
                    modal.destroy();
                    await resolveDashboard(id, name, openType);
                }

                function cbCancel() {
                    modal.destroy();
                    resolve(false);
                }
            }

            async function resolveDashboard(
                id: TDashboardItemKey | undefined,
                name: TStorageDashboardName,
                openType = EOpenType.CurrentWindow,
            ) {
                try {
                    if (isNil(id)) {
                        const dashboardItemKey = await firstValueFrom(
                            createDashboard(traceId, {
                                ...dashboard,
                                name,
                            }),
                        );

                        await navigateByDashboardItemKey(dashboardItemKey, openType);
                    } else {
                        const fullDashboard = await convertValueDescriptorObservableToPromise2(
                            getDashboard$(id).pipe(filter(isSyncedValueDescriptor)),
                        );

                        await firstValueFrom(
                            updateDashboard(traceId, {
                                ...fullDashboard,
                                dashboard: { ...dashboard, name },
                            }),
                        );

                        await navigateByDashboardItemKey(
                            getDashboardItemKeyFromDashboard(fullDashboard),
                            openType,
                        );

                        return;
                    }

                    resolve(true);
                } catch (err) {
                    showError(err as Error);
                    logger.error(err as Error);

                    resolve(false);
                }
            }
        });
    } catch {
        return false;
    }
}
