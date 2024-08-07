import {
    CheckOutlined,
    CloseCircleOutlined,
    CopyOutlined,
    FieldTimeOutlined,
    LinkOutlined,
    SaveOutlined,
} from '@ant-design/icons';
import type { Nanoseconds } from '@common/types';
import { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import { Item, Menu, Submenu } from '@frontend/common/src/components/ContextMenu';
import { getHexCssColor } from '@frontend/common/src/utils/colors';
import cn from 'classnames';
import { isEmpty, isUndefined } from 'lodash-es';
import type { ReactElement } from 'react';

import { CHART_WORLD_WIDTH_PRESETS } from '../../Chart/def';
import { EChartWorldWidthPreset } from '../../Chart/types';
import { cnBlueIcon, cnGreenIcon, cnIcon, cnRedIcon } from './view.css';

export const chartContextMenuId = 'CHART_CONTEXT_MENU';

export type TChartContextMenuProps = {
    onCopyTimestamp?: VoidFunction;
    onCopyLink?: VoidFunction;

    followModes?: EFollowMode[];
    followMode?: string;
    onSetFollowMode?: (mode: EFollowMode) => void;
    synced?: boolean;
    onToggleSync?: (state: boolean) => void;
    closestPoints?: boolean;
    toggleClosestPoints?: (state: boolean) => void;
    debugState?: boolean;
    onToggleDebugState?: (state: boolean) => void;
    valuesToCopy?: Array<{
        label: string;
        key: string | number;
        onClick: VoidFunction;
        color: undefined | string | number;
    }>;

    hasLeftAxis?: boolean;
    hasRightAxis?: boolean;
    displayZeroLeftAxis?: boolean;
    displayZeroRightAxis?: boolean;
    onToggleDisplayZeroLeft?: (state: boolean) => void;
    onToggleDisplayZeroRight?: (state: boolean) => void;

    currentWorldWidth?: number;
    onSetChartWidth?: (v: Nanoseconds) => void;

    onUploadState?: () => void;
};

export function ChartContextMenuView(): ReactElement {
    return (
        <Menu id={chartContextMenuId}>
            <ContextMenuContentView
                // propsFromTrigger will be pass through react-contexify -- GARBAGE...
                propsFromTrigger={{} as TChartContextMenuProps}
            />
        </Menu>
    );
}

const mapFollowModeToLabel = {
    [EFollowMode.none]: 'Disable',
    [EFollowMode.rare]: 'Rare',
    [EFollowMode.permament]: 'Permanent',
    [EFollowMode.lastPoint]: 'Last Point',
};

function ContextMenuContentView(params: {
    propsFromTrigger: TChartContextMenuProps;
}): ReactElement | null {
    const {
        onCopyTimestamp,
        onCopyLink,
        followMode,
        followModes,
        onSetFollowMode,
        synced,
        onToggleSync,
        closestPoints,
        toggleClosestPoints,
        debugState,
        onToggleDebugState,
        hasLeftAxis,
        hasRightAxis,
        displayZeroLeftAxis,
        displayZeroRightAxis,
        onToggleDisplayZeroLeft,
        onToggleDisplayZeroRight,
        currentWorldWidth,
        onSetChartWidth,
        onUploadState,
        valuesToCopy,
    } = params.propsFromTrigger;

    const followOptions = [...(followModes ?? [])].map((mode) => ({
        label: mapFollowModeToLabel[mode],
        value: mode,
    }));

    const chartWidthOptions = Object.values(EChartWorldWidthPreset).map(
        (value: EChartWorldWidthPreset) => ({
            label: value,
            value: CHART_WORLD_WIDTH_PRESETS[value],
        }),
    );

    return (
        <>
            {onCopyTimestamp && (
                <Item onClick={onCopyTimestamp}>
                    <FieldTimeOutlined className={cn(cnIcon, cnBlueIcon)} />
                    Copy UTC Date
                </Item>
            )}
            {onCopyLink && (
                <Item onClick={onCopyLink}>
                    <LinkOutlined className={cn(cnIcon, cnBlueIcon)} />
                    Copy Link with current time
                </Item>
            )}
            <CopyValueItem valuesToCopy={valuesToCopy} />
            <Submenu label="Interval">
                {chartWidthOptions.map((o) => (
                    <Item
                        key={o.value}
                        onClick={() => onSetChartWidth?.(o.value)}
                        active={o.value === currentWorldWidth}
                    >
                        {o.label}
                    </Item>
                ))}
            </Submenu>
            <Submenu label="Follow mode">
                {followOptions.map((o) => (
                    <Item
                        key={o.value}
                        onClick={() => onSetFollowMode?.(o.value)}
                        active={o.value === followMode}
                    >
                        {o.label}
                    </Item>
                ))}
            </Submenu>
            {closestPoints !== undefined ? (
                <Item onClick={() => toggleClosestPoints?.(!closestPoints)}>
                    <CheckIcon enabled={closestPoints} />
                    Closest Points
                </Item>
            ) : null}
            {synced !== undefined ? (
                <Item onClick={() => onToggleSync?.(!synced)}>
                    <CheckIcon enabled={synced} />
                    Sync
                </Item>
            ) : null}
            {debugState !== undefined ? (
                <Item onClick={() => onToggleDebugState?.(!debugState)}>
                    <CheckIcon enabled={debugState} />
                    Debug
                </Item>
            ) : null}
            {hasLeftAxis !== undefined ? (
                <Item
                    disabled={!hasLeftAxis}
                    onClick={() => onToggleDisplayZeroLeft?.(!displayZeroLeftAxis)}
                >
                    <CheckIcon enabled={displayZeroLeftAxis === true} />
                    Display Zero on Left Axis
                </Item>
            ) : null}
            {hasRightAxis !== undefined ? (
                <Item
                    disabled={!hasRightAxis}
                    onClick={() => onToggleDisplayZeroRight?.(!displayZeroRightAxis)}
                >
                    <CheckIcon enabled={displayZeroRightAxis === true} />
                    Display Zero on Right Axis
                </Item>
            ) : null}

            {onUploadState !== undefined ? (
                <Item onClick={() => onUploadState()}>
                    <SaveOutlined className={cn(cnIcon, cnBlueIcon)} />
                    Download internal state
                </Item>
            ) : null}
        </>
    );
}

function CheckIcon(props: { enabled: boolean }): ReactElement {
    return props.enabled ? (
        <CheckOutlined className={cn(cnIcon, cnGreenIcon)} />
    ) : (
        <CloseCircleOutlined className={cn(cnIcon, cnRedIcon)} />
    );
}

function CopyValueItem({ valuesToCopy }: Pick<TChartContextMenuProps, 'valuesToCopy'>) {
    if (isUndefined(valuesToCopy) || isEmpty(valuesToCopy)) return null;

    if (valuesToCopy.length === 1) {
        return (
            <Item onClick={valuesToCopy[0].onClick}>
                <CopyOutlined className={cn(cnIcon, cnBlueIcon)} />
                Copy Value
            </Item>
        );
    }

    return (
        <Submenu
            label={
                <>
                    <CopyOutlined className={cn(cnIcon, cnBlueIcon)} />
                    Copy Value of ...
                </>
            }
        >
            {valuesToCopy.map((v) => (
                <Item
                    key={v.key}
                    onClick={v.onClick}
                    style={{
                        textDecoration: `${getHexCssColor(v.color)} underline 2px`,
                    }}
                >
                    {v.label}
                </Item>
            ))}
        </Submenu>
    );
}
