import { DeleteOutlined } from '@ant-design/icons';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { Button } from '@frontend/common/src/components/Button';
import { InputNumber } from '@frontend/common/src/components/InputNumber';
import { Option, Select } from '@frontend/common/src/components/Select';
import { Switch } from '@frontend/common/src/components/Switch';
import type { ColumnType } from '@frontend/common/src/components/Table';
import { string2hex } from '@frontend/common/src/utils/colors';
import { TableColorPicker } from '@frontend/dashboard/src/components/Tables/TableChartsEditor/components/ColorPicker';
import { isNil } from 'lodash-es';
import { ReactElement } from 'react';

import { TChartProps } from '../../types';
import { DEFAULT_CHART_PROPS } from '../Chart/def';

export function getColumnWidth<T extends Pick<TChartProps, 'id' | 'width'>>(
    onChange: (id: TChartProps['id'], value: TChartProps['width']) => void,
): ColumnType<T> {
    return {
        title: <span title="Width">Width</span>,
        width: 50,
        shouldCellUpdate: (a, b) => a.width !== b.width,
        render: (_, record: T) => (
            <InputNumber
                style={{ width: 50 }}
                size="small"
                value={record.width}
                placeholder={String(DEFAULT_CHART_PROPS.width)}
                onChange={(v) => !isNil(v) && onChange(record.id, v)}
            />
        ),
    };
}

export function getColumnColor<T extends Pick<TChartProps, 'id' | 'color'>>(
    onChange: (id: TChartProps['id'], value: TChartProps['color']) => void,
): ColumnType<T> {
    return {
        title: <span title="Color">Color</span>,
        width: 30,
        shouldCellUpdate: (a, b) => a.color !== b.color,
        render: (_, record: T) => {
            return (
                <TableColorPicker
                    id={record.id}
                    color={record.color}
                    onChange={(color) => onChange(record.id, string2hex(color))}
                />
            );
        },
    };
}

export function getColumnOpacity<T extends Pick<TChartProps, 'id' | 'opacity'>>(
    onChange: (id: TChartProps['id'], value: TChartProps['opacity']) => void,
): ColumnType<T> {
    return {
        title: <span title="Opacity">Opacity</span>,
        width: 50,
        shouldCellUpdate: (a, b) => a.opacity !== b.opacity,
        render: (_, record: T) => (
            <InputNumber
                style={{ width: 50 }}
                size="small"
                value={record.opacity}
                placeholder={String(DEFAULT_CHART_PROPS.opacity)}
                onChange={(v) => !isNil(v) && onChange(record.id, v)}
            />
        ),
    };
}

export function getColumnType<T extends Pick<TChartProps, 'id' | 'type'>>(
    onChange: (id: TChartProps['id'], value: TChartProps['type']) => void,
): ColumnType<T> {
    return {
        title: <span title="Type">Type</span>,
        width: 80,
        shouldCellUpdate: (a, b) => a.type !== b.type,
        render: (_, record: T) => (
            <Select
                style={{ width: 80 }}
                size="small"
                value={record.type}
                placeholder={DEFAULT_CHART_PROPS.type}
                onChange={(v: TChartProps['type']) => onChange(record.id, v)}
            >
                {getOptionsFromEnum(EChartType)}
            </Select>
        ),
    };
}

export function getColumnVisible<T extends Pick<TChartProps, 'id' | 'visible'>>(
    onChange: (id: TChartProps['id'], value: TChartProps['visible']) => void,
): ColumnType<T> {
    return {
        title: <span title="Visible">Visible</span>,
        width: 40,
        shouldCellUpdate: (a, b) => a.visible !== b.visible,
        render: (_, record: T) => (
            <Switch
                size="small"
                checked={record.visible ?? DEFAULT_CHART_PROPS.visible}
                onChange={(checked: boolean) => onChange(record.id, checked)}
            />
        ),
    };
}
export function getColumnYAxis<T extends Pick<TChartProps, 'id' | 'yAxis'>>(
    onChange: (id: TChartProps['id'], value: TChartProps['yAxis']) => void,
): ColumnType<T> {
    return {
        title: <span title="Axis">Axis</span>,
        width: 80,
        shouldCellUpdate: (a, b) => a.yAxis !== b.yAxis,
        render: (_, record: T) => (
            <Select
                style={{ width: 80 }}
                size="small"
                value={record.yAxis ?? EVirtualViewport.left}
                onChange={(v) => onChange(record.id, v)}
            >
                {getOptionsFromEnum(EVirtualViewport)}
            </Select>
        ),
    };
}

export function getColumnDelete<T extends Pick<TChartProps, 'id'>>(
    onClick: (id: TChartProps['id']) => void,
): ColumnType<T> {
    return {
        title: 'Del',
        width: 40,
        shouldCellUpdate: (a, b) => a.id !== b.id,
        render: (_, record: T) => (
            <Button icon={<DeleteOutlined />} onClick={() => onClick(record.id)} />
        ),
    };
}

function getOptionsFromEnum(_enum: object): ReactElement[] {
    return Object.values(_enum).map((v) => {
        return (
            <Option key={v} value={v}>
                {v}
            </Option>
        );
    });
}
