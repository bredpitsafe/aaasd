import {
    AppstoreOutlined,
    CloudUploadOutlined,
    EditOutlined,
    ImportOutlined,
    LayoutOutlined,
    PlusSquareOutlined,
    SaveOutlined,
    ShrinkOutlined,
    SyncOutlined,
    UndoOutlined,
} from '@ant-design/icons';
import { generateTraceId } from '@common/utils';
import { assert } from '@common/utils/src/assert.ts';
import {
    DashboardPageProps,
    EDashboardPageSelectors,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Button } from '@frontend/common/src/components/Button';
import { Divider } from '@frontend/common/src/components/Divider';
import type { DropdownProps } from '@frontend/common/src/components/Dropdown';
import { Dropdown } from '@frontend/common/src/components/Dropdown';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import type {
    TNavChildRenderFunction,
    TNavChildrenProps,
} from '@frontend/common/src/components/Nav/view';
import {
    cnBTRunIndicator,
    cnDivider,
    cnDividerInvertedColor,
    cnSection,
    cnSectionFill,
    cnSectionRow,
} from '@frontend/common/src/components/Nav/view.css';
import { Popover } from '@frontend/common/src/components/Popover';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { useModule } from '@frontend/common/src/di/react';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import cn from 'classnames';
import { isNil, isString } from 'lodash-es';
import { useCallback, useMemo, useRef } from 'react';
import { of } from 'rxjs';

import { FileImport } from '../../../components/FileImport/fileImport';
import { useConnectedOpenShareDialog } from '../../../components/hooks/useConnectedOpenShareDialog';
import { useImportDashboardFile } from '../../../components/hooks/useImportDashboardFile';
import { ConnectedExportButton } from '../../../components/Layout/components/ConnectedExportButton';
import { useConnectedDashboard } from '../../../components/Layout/hooks/useConnectedDashboard';
import { useConnectedIsUpdating } from '../../../components/Layout/hooks/useConnectedIsUpdating';
import { PermissionsCountBadge } from '../../../components/PermissionsCountBadge/view';
import { ModuleAddPanel } from '../../../modules/actions/dashboards/addPanel';
import { ModuleCreateDashboardLayout } from '../../../modules/actions/dashboards/createDashboardLayout';
import { ModuleDeleteDashboardLayout } from '../../../modules/actions/dashboards/deleteDashboardLayout';
import { ModuleResetDashboardDraft } from '../../../modules/actions/dashboards/resetDashboardDraft';
import { ModuleSwitchDashboardLayout } from '../../../modules/actions/dashboards/switchDashboardLayout';
import { ModuleUpdateGridLayout } from '../../../modules/actions/dashboards/updateGridLayout';
import { ModuleOpenModalFullDashboardEditor } from '../../../modules/actions/modals/openModalFullDashboardConfig';
import { ModuleSaveDashboard } from '../../../modules/actions/modals/saveDashboard';
import { ModuleUI } from '../../../modules/ui/module';
import { isStorageDashboard } from '../../../types/fullDashboard/guards';
import type { TGridLayout } from '../../../types/layout';
import { EPanelType } from '../../../types/panel';
import {
    getDashboardItemKeyFromDashboard,
    hasDashboardDraft,
    hasDashboardOwnership,
    isReadonlyDashboardsStorageItem,
} from '../../../utils/dashboards';
import { BTRunSelector } from '../../BTRunSelector';
import { DateTimePicker } from './DateTimePicker';
import { LayoutPopupContent } from './LayoutPopupContent';

type TUseNavChildrenProps = {
    onToggleDashboardsDialog: VoidFunction;
};

const PANEL_TYPE_LABELS: Record<EPanelType, string> = {
    [EPanelType.Charts]: 'Chart',
    [EPanelType.CustomViewGrid]: 'Grid',
    [EPanelType.CustomViewTable]: 'Table',
};
export const useNavChildren: (props: TUseNavChildrenProps) => TNavChildRenderFunction = ({
    onToggleDashboardsDialog,
}) => {
    const { setCurrentChartsTime, toggleCompactMode, toggleSyncMode } = useModule(ModuleUI);
    const { getSyncMode$, compactMode$ } = useModule(ModuleUI);
    const addPanel = useModule(ModuleAddPanel);
    const saveDashboard = useModule(ModuleSaveDashboard);
    const updateGridLayout = useModule(ModuleUpdateGridLayout);
    const resetDashboardDraft = useModule(ModuleResetDashboardDraft);
    const deleteDashboardLayout = useModule(ModuleDeleteDashboardLayout);
    const switchDashboardLayout = useModule(ModuleSwitchDashboardLayout);
    const createDashboardLayout = useModule(ModuleCreateDashboardLayout);
    const openModalFullDashboardEditor = useModule(ModuleOpenModalFullDashboardEditor);

    const [timeZoneInfo] = useTimeZoneInfoSettings();

    const dashboardValueDescriptor = useConnectedDashboard();
    const fullDashboard = useMemo(
        () =>
            isSyncedValueDescriptor(dashboardValueDescriptor)
                ? dashboardValueDescriptor.value
                : undefined,
        [dashboardValueDescriptor],
    );
    const dashboardItemKey = useMemo(
        () =>
            isSyncedValueDescriptor(dashboardValueDescriptor)
                ? getDashboardItemKeyFromDashboard(dashboardValueDescriptor.value)
                : undefined,
        [dashboardValueDescriptor],
    );

    const isUpdating = useConnectedIsUpdating(dashboardItemKey);
    const [showShareDialog, openingShareDialog] = useConnectedOpenShareDialog(dashboardItemKey);

    const hasDashboard = !isNil(fullDashboard);
    const isDirty = hasDashboard && hasDashboardDraft(fullDashboard);
    const sharePermission =
        hasDashboard &&
        isStorageDashboard(fullDashboard) &&
        hasDashboardOwnership(fullDashboard.item)
            ? fullDashboard.item.sharePermission
            : undefined;
    const canBePersisted =
        hasDashboard &&
        !isUpdating &&
        (!isStorageDashboard(fullDashboard) ||
            isDirty ||
            isReadonlyDashboardsStorageItem(fullDashboard.item));
    const canBeReverted = isDirty && !isUpdating;

    const permissionsCount =
        hasDashboard && isStorageDashboard(fullDashboard)
            ? fullDashboard.item.permissionsCount ?? 0
            : 0;

    const syncMode = useSyncObservable(
        useMemo(
            () => (isNil(dashboardItemKey) ? of(false) : getSyncMode$(dashboardItemKey)),
            [getSyncMode$, dashboardItemKey],
        ),
        false,
    );
    const compactMode = useSyncObservable(
        useMemo(
            () => (isNil(dashboardItemKey) ? of(false) : compactMode$),
            [dashboardItemKey, compactMode$],
        ),
        false,
    );

    const [handleAddPanel] = useNotifiedObservableFunction(
        (type: EPanelType) => {
            assert(!isNil(dashboardItemKey), 'dashboardItemKey cannot be empty');
            return addPanel(type, { traceId: generateTraceId() });
        },
        {
            getNotifyTitle: () => ({ loading: 'Adding panel', success: 'Panel added' }),
        },
    );

    const [handleSelectLayout] = useNotifiedObservableFunction(
        (layout: TGridLayout) => {
            assert(!isNil(dashboardItemKey), 'dashboardItemKey cannot be empty');
            return updateGridLayout(layout, { traceId: generateTraceId() });
        },
        {
            getNotifyTitle: () => ({ loading: 'Updating layout', success: 'Layout updated' }),
        },
    );

    const handleToggleCompactMode = useFunction(() => toggleCompactMode());

    const handleToggleSyncMode = useFunction(() => {
        if (isNil(fullDashboard)) {
            return;
        }
        toggleSyncMode(getDashboardItemKeyFromDashboard(fullDashboard));
    });

    const [handleModifyDashboard] = useNotifiedObservableFunction(() => {
        assert(!isNil(dashboardItemKey), 'dashboardItemKey cannot be empty');
        return openModalFullDashboardEditor({ dashboardItemKey }, { traceId: generateTraceId() });
    });
    const [handlePersistDashboard] = useNotifiedObservableFunction(
        () => {
            assert(!isNil(dashboardItemKey), 'dashboardItemKey cannot be empty');
            return saveDashboard(dashboardItemKey, { traceId: generateTraceId() });
        },
        {
            getNotifyTitle: () => ({ loading: 'Saving dashboard', success: 'Dashboard saved' }),
        },
    );
    const [handleRevertDashboard] = useNotifiedObservableFunction(
        () => {
            assert(!isNil(dashboardItemKey), 'dashboardItemKey cannot be empty');
            return resetDashboardDraft(dashboardItemKey, { traceId: generateTraceId() });
        },
        {
            getNotifyTitle: () => ({
                loading: 'Reverting dashboard',
                success: 'Dashboard reverted',
            }),
        },
    );

    const [handleSwitchLayout] = useNotifiedObservableFunction((layoutName: string) => {
        return switchDashboardLayout(layoutName, { traceId: generateTraceId() });
    });

    const [handleCreateLayout] = useNotifiedObservableFunction((layoutName: string) => {
        return createDashboardLayout(layoutName, { traceId: generateTraceId() });
    });

    const [handleDeleteLayout] = useNotifiedObservableFunction((layoutName: string) => {
        return deleteDashboardLayout(layoutName, { traceId: generateTraceId() });
    });

    const dashboardImportRef = useRef<{ showWindow: () => void }>(null);
    const handleImportDashboardFile = useImportDashboardFile();
    const handleClickImportDashboardFile = useFunction(() => {
        return dashboardImportRef?.current?.showWindow();
    });

    const addMenu: DropdownProps['menu'] = useMemo(() => {
        return {
            items: Object.values(EPanelType).map((key) => {
                return {
                    key,
                    label: PANEL_TYPE_LABELS[key],
                    onClick: () => handleAddPanel(key),
                };
            }),
        };
    }, [handleAddPanel]);

    return useCallback(
        ({ type, collapsed }: TNavChildrenProps) => {
            const selectDashboardButton =
                type === ENavType.Hidden ? (
                    <FloatButton
                        icon={<AppstoreOutlined />}
                        tooltip={
                            <SelectDashboardTooltip dashboardName={fullDashboard?.dashboard.name} />
                        }
                        onClick={onToggleDashboardsDialog}
                    />
                ) : (
                    <Tooltip
                        title={
                            <SelectDashboardTooltip dashboardName={fullDashboard?.dashboard.name} />
                        }
                        placement="right"
                    >
                        <Button
                            icon={<AppstoreOutlined />}
                            onClick={onToggleDashboardsDialog}
                            {...DashboardPageProps[EDashboardPageSelectors.SelectDashboardButton]}
                        >
                            {!collapsed && 'Dashboards'}
                        </Button>
                    </Tooltip>
                );

            const dateTimePicker = (
                <DateTimePicker
                    type={type}
                    timeZone={timeZoneInfo.timeZone}
                    collapsed={collapsed}
                    disabled={!hasDashboard}
                    onChange={setCurrentChartsTime}
                />
            );

            if (type === ENavType.Hidden) {
                return (
                    <>
                        {dateTimePicker}
                        {selectDashboardButton}
                    </>
                );
            }

            return (
                <>
                    <div className={cn(cnSection, cnSectionFill)}>
                        <div
                            className={cn(cnSection, {
                                [cnSectionRow]: !collapsed,
                            })}
                        >
                            <DateTimePicker
                                type={type}
                                timeZone={timeZoneInfo.timeZone}
                                collapsed={collapsed}
                                disabled={!hasDashboard}
                                onChange={setCurrentChartsTime}
                            />
                        </div>

                        <div className={cn(cnSection)}>
                            <Popover
                                content={
                                    <LayoutPopupContent
                                        fullDashboard={fullDashboard}
                                        switchLayout={handleSwitchLayout}
                                        createLayout={handleCreateLayout}
                                        deleteLayout={handleDeleteLayout}
                                        onSelectLayout={handleSelectLayout}
                                    />
                                }
                                trigger="click"
                                placement="rightBottom"
                            >
                                <Button
                                    {...DashboardPageProps[EDashboardPageSelectors.SetLayoutButton]}
                                    title="Set Layout"
                                    disabled={!hasDashboard}
                                    icon={<LayoutOutlined />}
                                >
                                    {!collapsed && 'Set Layout'}
                                </Button>
                            </Popover>
                            <Dropdown
                                menu={addMenu}
                                placement="bottomRight"
                                disabled={!hasDashboard}
                            >
                                <Button
                                    {...DashboardPageProps[EDashboardPageSelectors.AddPanelButton]}
                                    icon={<PlusSquareOutlined />}
                                    title="Add panel"
                                >
                                    {!collapsed && 'Add Panel'}
                                </Button>
                            </Dropdown>

                            <Button
                                {...DashboardPageProps[EDashboardPageSelectors.EditDashboardButton]}
                                icon={<EditOutlined />}
                                title="Edit Dashboard"
                                disabled={!hasDashboard}
                                onClick={handleModifyDashboard}
                            >
                                {!collapsed && 'Edit Dashboard'}
                            </Button>

                            <Button
                                {...DashboardPageProps[EDashboardPageSelectors.SaveChangesButton]}
                                icon={<SaveOutlined />}
                                title="Save Changes"
                                disabled={!canBePersisted}
                                onClick={handlePersistDashboard}
                                loading={isUpdating}
                            >
                                {!collapsed && 'Save Changes'}
                            </Button>
                            <Button
                                {...DashboardPageProps[EDashboardPageSelectors.RevertChangesButton]}
                                icon={<UndoOutlined />}
                                title="Revert Changes"
                                disabled={!canBeReverted}
                                onClick={handleRevertDashboard}
                            >
                                {!collapsed && 'Revert Changes'}
                            </Button>
                            {!isNil(sharePermission) && (
                                <PermissionsCountBadge
                                    permissionsCount={permissionsCount}
                                    offset={[0, 8]}
                                >
                                    <Button
                                        {...DashboardPageProps[
                                            EDashboardPageSelectors.ShareDashboardButton
                                        ]}
                                        title="Share Dashboard"
                                        icon={<CloudUploadOutlined />}
                                        loading={openingShareDialog}
                                        onClick={showShareDialog}
                                    >
                                        {!collapsed && 'Share Dashboard'}
                                    </Button>
                                </PermissionsCountBadge>
                            )}
                            <ConnectedExportButton
                                {...DashboardPageProps[EDashboardPageSelectors.ExportCloneButton]}
                                title="Export/Clone"
                                disabled={!hasDashboard}
                            >
                                {!collapsed && 'Export/Clone'}
                            </ConnectedExportButton>
                        </div>

                        <Divider type="horizontal" className={cnDivider} />

                        <div className={cnSection}>
                            <Button
                                {...DashboardPageProps[
                                    EDashboardPageSelectors.ToggleCompactModeButton
                                ]}
                                type={compactMode ? 'primary' : 'default'}
                                icon={<ShrinkOutlined />}
                                title="Toggle Compact Mode"
                                disabled={!hasDashboard}
                                onClick={handleToggleCompactMode}
                            >
                                {!collapsed && 'Compact'}
                            </Button>
                            <Button
                                {...DashboardPageProps[EDashboardPageSelectors.ToggleSyncModButton]}
                                icon={<SyncOutlined />}
                                type={syncMode ? 'primary' : 'default'}
                                title="Toggle Sync Mode"
                                disabled={!hasDashboard}
                                onClick={handleToggleSyncMode}
                            >
                                {!collapsed && 'Sync'}
                            </Button>
                        </div>
                    </div>

                    <div className={cnSection}>
                        <FileImport
                            ref={dashboardImportRef}
                            onImportFile={handleImportDashboardFile}
                        >
                            <Button
                                icon={<ImportOutlined />}
                                title="Import Dashboard"
                                onClick={handleClickImportDashboardFile}
                                {...DashboardPageProps[
                                    EDashboardPageSelectors.DashboardImportButton
                                ]}
                            >
                                {!collapsed && 'Import Dashboard'}
                            </Button>
                        </FileImport>
                        {selectDashboardButton}

                        <BTRunSelector
                            className={cnBTRunIndicator}
                            type={collapsed ? 'compact' : 'full'}
                        />
                    </div>
                </>
            );
        },
        [
            canBePersisted,
            canBeReverted,
            compactMode,
            fullDashboard,
            handleClickImportDashboardFile,
            handleCreateLayout,
            handleDeleteLayout,
            handleImportDashboardFile,
            handleModifyDashboard,
            handlePersistDashboard,
            handleRevertDashboard,
            handleSelectLayout,
            handleSwitchLayout,
            handleToggleCompactMode,
            onToggleDashboardsDialog,
            handleToggleSyncMode,
            hasDashboard,
            isUpdating,
            openingShareDialog,
            permissionsCount,
            setCurrentChartsTime,
            sharePermission,
            showShareDialog,
            syncMode,
            timeZoneInfo.timeZone,
            addMenu,
        ],
    );
};

const SelectDashboardTooltip = ({ dashboardName }: { dashboardName?: string }) => {
    return (
        <div>
            Select Dashboard
            {isString(dashboardName) ? (
                <>
                    <Divider type="horizontal" className={cnDividerInvertedColor} />
                    {`Current: ${dashboardName}`}
                </>
            ) : null}
        </div>
    );
};
