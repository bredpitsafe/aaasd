import { assertNever } from '@common/utils/src/assert.ts';
import type { TBase64 } from '@common/utils/src/base64.ts';
import { base64ToString } from '@common/utils/src/base64.ts';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type {
    TStorageDashboardConfig,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import { EGrpcErrorCode, GrpcError } from '@frontend/common/src/types/GrpcError.ts';
import { EDataType } from '@frontend/common/src/utils/dataFormat';
import { Defer } from '@frontend/common/src/utils/Defer.ts';
import { createObservableProcedure } from '@frontend/common/src/utils/LPC/createObservableProcedure.ts';
import {
    mapValueDescriptor,
    squashValueDescriptors,
    switchMapValueDescriptor,
    takeWhileFirstSyncValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { isNil } from 'lodash-es';
import { combineLatest, from, Observable, of, switchMap } from 'rxjs';
import { first, map } from 'rxjs/operators';

import type { TDashboard } from '../../../types/dashboard';
import type { TImportableDashboard } from '../../../types/dashboard/importable';
import type { TDashboardItemKey } from '../../../types/fullDashboard';
import { EOpenType } from '../../../types/router';
import { getDashboardItemKeyFromDashboard, unifyIds } from '../../../utils/dashboards';
import {
    convertDashboardToExportableDashboardEditor,
    convertDashboardToXml,
    convertImportableXmlDashboardToDashboard,
    convertXMLToDashboard,
    validateFullDashboardJsonStructure,
} from '../../../utils/dashboards/converters';
import { ModuleUI } from '../../ui/module';
import { ModuleCreateDashboard } from '../dashboards/createDashboard';
import { ModuleUpdateDashboard } from '../dashboards/updateDashboard';
import { ModuleGetDashboardList } from '../fullDashboards/getDashboardList';
import { ModuleSubscribeToDashboard } from '../fullDashboards/ModuleSubscribeToDashboard.ts';
import { ModuleNavigateByDashboardItemKey } from '../navigation/navigateByDashboardItemKey.ts';

export const ModuleImportDashboard = createObservableProcedure((ctx) => {
    const importFullDashboardFromBase64 = ModuleImportFullDashboardFromBase64(ctx);
    const importFullDashboardFromXmlString = ModuleImportFullDashboardFromXmlString(ctx);
    const importFullDashboardFromJsonString = ModuleImportFullDashboardFromJsonString(ctx);

    return (
        {
            type,
            config,
            confirmAdd,
        }: {
            type: EDataType;
            config: string;
            confirmAdd?: boolean;
        },
        options,
    ) => {
        if (type === EDataType.XML) {
            return importFullDashboardFromXmlString(
                {
                    config: config as TStorageDashboardConfig,
                    confirmAdd,
                },
                options,
            );
        }

        if (type === EDataType.JSON) {
            return importFullDashboardFromJsonString({ config, confirmAdd }, options);
        }

        if (type === EDataType.Base64) {
            return importFullDashboardFromBase64(
                {
                    config: config as TBase64<TStorageDashboardConfig>,
                    confirmAdd,
                },
                options,
            );
        }

        assertNever(type);
    };
});

const ModuleImportFullDashboardFromBase64 = createObservableProcedure((ctx) => {
    const importFullDashboardFromJsonString = ModuleImportFullDashboardFromJsonString(ctx);

    return (
        {
            config,
            confirmAdd,
        }: {
            config: TBase64<string>;
            confirmAdd?: boolean;
        },
        options,
    ) => {
        try {
            return importFullDashboardFromJsonString(
                { config: base64ToString(config), confirmAdd },
                options,
            );
        } catch (e) {
            throw new Error('Could not parse dashboard base64');
        }
    };
});

const ModuleImportFullDashboardFromJsonString = createObservableProcedure((ctx) => {
    const importFullDashboardFromJson = ModuleImportFullDashboardFromJson(ctx);

    return ({ config, confirmAdd }: { config: string; confirmAdd?: boolean }, options) => {
        return new Observable<TImportableDashboard>((subscriber) => {
            subscriber.next(JSON.parse(config));
            subscriber.complete();
        }).pipe(
            switchMap((json) => {
                return from(validateFullDashboardJsonStructure(json)).pipe(
                    map((result) => {
                        if (result) return json;
                        throw new GrpcError('Incorrect Dashboard JSON', {
                            code: EGrpcErrorCode.INVALID_ARGUMENT,
                        });
                    }),
                );
            }),
            switchMap((json) => {
                const dashboard = convertImportableXmlDashboardToDashboard(json);
                return importFullDashboardFromJson(
                    { dashboard: unifyIds(dashboard), confirmAdd },
                    options,
                );
            }),
        );
    };
});

const ModuleImportFullDashboardFromXmlString = createObservableProcedure((ctx) => {
    const importFullDashboardFromJson = ModuleImportFullDashboardFromJson(ctx);

    return (
        { config, confirmAdd }: { config: TStorageDashboardConfig; confirmAdd?: boolean },
        options,
    ) => {
        return from(convertXMLToDashboard(config)).pipe(
            switchMap((dashboard) => {
                return importFullDashboardFromJson(
                    { dashboard: unifyIds(dashboard), confirmAdd },
                    options,
                );
            }),
        );
    };
});

const ModuleImportFullDashboardFromJson = createObservableProcedure((ctx) => {
    const { show } = ModuleModals(ctx);
    const { currentDashboardItemKey$ } = ModuleUI(ctx);
    const getDashboardList = ModuleGetDashboardList(ctx);
    const resolveDashboard = ModuleResolveDashboard(ctx);

    return (
        {
            dashboard,
            confirmAdd,
        }: {
            dashboard: TDashboard;
            confirmAdd?: boolean;
        },
        options,
    ) => {
        if (confirmAdd !== true) {
            return resolveDashboard(
                {
                    name: dashboard.name,
                    dashboard,
                },
                options,
            );
        }

        return combineLatest([
            currentDashboardItemKey$.pipe(first(), map(createSyncedValueDescriptor)),
            getDashboardList(undefined, options),
            import('../../../components/modals/SelectDashboardNameDialog').then((m) =>
                createSyncedValueDescriptor(m.SelectDashboardNameDialog),
            ),
        ]).pipe(
            squashValueDescriptors(),
            takeWhileFirstSyncValueDescriptor(),
            switchMapValueDescriptor(({ value }) => {
                const defer = new Defer<
                    | undefined
                    | {
                          id?: TDashboardItemKey;
                          name: TStorageDashboardName;
                          dashboard: TDashboard;
                          openType?: EOpenType;
                      }
                >();
                const [currentDashboardItemKey, dashboardItems, SelectDashboardNameDialog] = value;
                const handleSet = (
                    id: TDashboardItemKey | undefined,
                    name: TStorageDashboardName,
                    openType: EOpenType,
                ) => {
                    modal.destroy();
                    defer.resolve({
                        id,
                        name,
                        openType,
                        dashboard,
                    });
                };
                const handleCancel = () => {
                    modal.destroy();
                    defer.resolve(undefined);
                };

                const modal = show(
                    <SelectDashboardNameDialog
                        title="Add dashboard"
                        name={dashboard.name}
                        dashboardItems={dashboardItems}
                        allowToChooseNewTab={!isNil(currentDashboardItemKey)}
                        onSet={handleSet}
                        onCancel={handleCancel}
                    />,
                );

                return from(defer.promise.then(createSyncedValueDescriptor));
            }),
            switchMapValueDescriptor(({ value }) => {
                return isNil(value)
                    ? of(createSyncedValueDescriptor(false))
                    : resolveDashboard(value, options);
            }),
        );
    };
});

// TODO: give better name/split to 2 functions
const ModuleResolveDashboard = createObservableProcedure((ctx) => {
    const subscribeToDashboard = ModuleSubscribeToDashboard(ctx);
    const updateDashboard = ModuleUpdateDashboard(ctx);
    const createDashboard = ModuleCreateDashboard(ctx);
    const navigateByDashboardItemKey = ModuleNavigateByDashboardItemKey(ctx);

    return (
        {
            id,
            name,
            dashboard,
            openType = EOpenType.CurrentWindow,
        }: {
            id?: TDashboardItemKey;
            name: TStorageDashboardName;
            dashboard: TDashboard;
            openType?: EOpenType;
        },
        options,
    ) => {
        if (isNil(id)) {
            return createDashboard(
                {
                    name,
                    config: convertDashboardToXml(
                        convertDashboardToExportableDashboardEditor(dashboard),
                    ),
                },
                options,
            ).pipe(
                switchMapValueDescriptor(({ value: key }) => {
                    return navigateByDashboardItemKey({ key, openType }, options).pipe(
                        map(createSyncedValueDescriptor),
                    );
                }),
                mapValueDescriptor(() => createSyncedValueDescriptor(true)),
            );
        } else {
            return subscribeToDashboard(id, options).pipe(
                takeWhileFirstSyncValueDescriptor(),
                switchMapValueDescriptor(({ value }) => {
                    return updateDashboard(
                        {
                            ...value,
                            dashboard: { ...dashboard, name },
                        },
                        options,
                    ).pipe(mapValueDescriptor(() => createSyncedValueDescriptor(value)));
                }),
                switchMapValueDescriptor(({ value }) => {
                    return navigateByDashboardItemKey(
                        {
                            key: getDashboardItemKeyFromDashboard(value),
                            openType,
                        },
                        options,
                    ).pipe(map(() => createSyncedValueDescriptor(true)));
                }),
            );
        }
    };
});
