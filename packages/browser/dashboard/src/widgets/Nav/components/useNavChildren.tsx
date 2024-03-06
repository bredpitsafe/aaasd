import {
    AppstoreOutlined,
    ClockCircleOutlined,
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
import { createTestProps } from '@frontend/common/e2e';
import { EDashboardPageSelectors } from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { ENavType } from '@frontend/common/src/actors/Settings/types';
import { Button } from '@frontend/common/src/components/Button';
import { Divider } from '@frontend/common/src/components/Divider';
import { Dropdown, DropdownProps } from '@frontend/common/src/components/Dropdown';
import { FloatButton } from '@frontend/common/src/components/FloatButton';
import {
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
    cnTimeZone,
    cnTimeZoneIcon,
} from '@frontend/common/src/components/Nav/view.css';
import { Popover } from '@frontend/common/src/components/Popover';
import { useTimeZoneInfoSettings } from '@frontend/common/src/components/Settings/hooks/useTimeZoneSettings';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { useModule } from '@frontend/common/src/di/react';
import { EApplicationName } from '@frontend/common/src/types/app';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { getTimeZoneFullName } from '@frontend/common/src/utils/time';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import cn from 'classnames';
import { isNil, isString } from 'lodash-es';
import { useCallback, useMemo, useRef } from 'react';
import { firstValueFrom, of } from 'rxjs';

import { FileImport } from '../../../components/FileImport/fileImport';
import { useConnectedOpenShareDialog } from '../../../components/hooks/useConnectedOpenShareDialog';
import { useImportDashboardFile } from '../../../components/hooks/useImportDashboardFile';
import { ConnectedExportButton } from '../../../components/Layout/components/ConnectedExportButton';
import { useConnectedDashboard } from '../../../components/Layout/hooks/useConnectedDashboard';
import { useConnectedIsUpdating } from '../../../components/Layout/hooks/useConnectedIsUpdating';
import { PermissionsCountBadge } from '../../../components/PermissionsCountBadge/view';
import { ModuleDashboardActions } from '../../../modules/actions';
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
export const useNavChildren: (props: TUseNavChildrenProps) => TNavChildRenderFunction = (props) => {
    const { setCurrentChartsTime, toggleCompactMode, toggleSyncMode } = useModule(ModuleUI);
    const {
        saveDashboard,
        resetDashboardDraft,
        switchDashboardLayout,
        createDashboardLayout,
        deleteDashboardLayout,
        openModalFullDashboardEditor,
    } = useModule(ModuleDashboardActions);
    const { getSyncMode$, compactMode$ } = useModule(ModuleUI);
    const { onToggleDashboardsDialog } = props;
    const { addPanel, updateGridLayout } = useModule(ModuleDashboardActions);

    const [timeZoneInfo] = useTimeZoneInfoSettings(EApplicationName.Dashboard);

    const timeZoneName = getTimeZoneFullName(timeZoneInfo);

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

    const handleAddPanel = useFunction((type: EPanelType) => {
        if (isNil(dashboardItemKey)) {
            return;
        }
        return firstValueFrom(addPanel(type, generateTraceId()));
    });

    const handleSelectLayout = useFunction((layout: TGridLayout) => {
        if (isNil(dashboardItemKey)) {
            return;
        }
        return firstValueFrom(updateGridLayout(generateTraceId(), layout));
    });

    const handleToggleCompactMode = useFunction(() => toggleCompactMode());

    const handleToggleSyncMode = useFunction(() => {
        if (isNil(fullDashboard)) {
            return;
        }
        toggleSyncMode(getDashboardItemKeyFromDashboard(fullDashboard));
    });

    const handleModifyDashboard = useFunction(async () => {
        if (isNil(dashboardItemKey)) {
            return;
        }
        await openModalFullDashboardEditor(generateTraceId(), dashboardItemKey);
    });
    const handlePersistDashboard = useFunction(async () => {
        if (isNil(dashboardItemKey)) {
            return;
        }
        await firstValueFrom(saveDashboard(generateTraceId(), dashboardItemKey));
    });
    const handleRevertDashboard = useFunction(async () => {
        if (isNil(dashboardItemKey)) {
            return;
        }
        await firstValueFrom(resetDashboardDraft(generateTraceId(), dashboardItemKey));
    });

    const handleSwitchLayout = useFunction(async (layoutName: string) => {
        await firstValueFrom(switchDashboardLayout(generateTraceId(), layoutName));
    });

    const handleCreateLayout = useFunction(async (layoutName: string) => {
        await firstValueFrom(createDashboardLayout(generateTraceId(), layoutName));
    });

    const handleDeleteLayout = useFunction(async (layoutName: string) => {
        await firstValueFrom(deleteDashboardLayout(generateTraceId(), layoutName));
    });

    const handleToggleDashboardsDialog = useFunction(() => {
        onToggleDashboardsDialog();
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
                        onClick={handleToggleDashboardsDialog}
                        {...createTestProps(EDashboardPageSelectors.DashboardsMenuButton)}
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
                            onClick={handleToggleDashboardsDialog}
                            {...createTestProps(EDashboardPageSelectors.DashboardsMenuButton)}
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
                        {collapsed ? (
                            <Tooltip title={timeZoneName} showArrow={false}>
                                <div className={cnTimeZoneIcon}>
                                    <ClockCircleOutlined />
                                </div>
                            </Tooltip>
                        ) : (
                            <div className={cnTimeZone}>{timeZoneName}</div>
                        )}

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
                                <Button icon={<PlusSquareOutlined />} title="Add panel">
                                    {!collapsed && 'Add Panel'}
                                </Button>
                            </Dropdown>

                            <Button
                                icon={<EditOutlined />}
                                title="Edit Dashboard"
                                disabled={!hasDashboard}
                                onClick={handleModifyDashboard}
                            >
                                {!collapsed && 'Edit Dashboard'}
                            </Button>

                            <Button
                                icon={<SaveOutlined />}
                                title="Save Changes"
                                disabled={!canBePersisted}
                                onClick={handlePersistDashboard}
                                loading={isUpdating}
                            >
                                {!collapsed && 'Save Changes'}
                            </Button>
                            <Button
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
                                        title="Share Dashboard"
                                        icon={<CloudUploadOutlined />}
                                        loading={openingShareDialog}
                                        onClick={showShareDialog}
                                    >
                                        {!collapsed && 'Share Dashboard'}
                                    </Button>
                                </PermissionsCountBadge>
                            )}
                            <ConnectedExportButton title="Export/Clone" disabled={!hasDashboard}>
                                {!collapsed && 'Export/Clone'}
                            </ConnectedExportButton>
                        </div>

                        <Divider type="horizontal" className={cnDivider} />

                        <div className={cnSection}>
                            <Button
                                type={compactMode ? 'primary' : 'default'}
                                icon={<ShrinkOutlined />}
                                title="Toggle compact mode"
                                disabled={!hasDashboard}
                                onClick={handleToggleCompactMode}
                            >
                                {!collapsed && 'Compact'}
                            </Button>
                            <Button
                                icon={<SyncOutlined />}
                                type={syncMode ? 'primary' : 'default'}
                                title="Toggle sync mode"
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
                                {...createTestProps(EDashboardPageSelectors.DashboardImportButton)}
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
            handleToggleDashboardsDialog,
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
            timeZoneName,
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
