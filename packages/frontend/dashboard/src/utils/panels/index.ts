import { assertNever } from '@common/utils/src/assert.ts';
import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type {
    TXmlImportableGrid,
    TXmlImportableTable,
} from '@frontend/common/src/utils/CustomView/parsers/defs';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';
import { Promql } from '@frontend/common/src/utils/Promql';
import { getRandomUint32 } from '@frontend/common/src/utils/random';
import hash from 'hash-sum';
import { isNil } from 'lodash-es';

import type { TGridCellPosition, TGridLayout } from '../../types/layout';
import type {
    TBasePanel,
    TChartPanel,
    TChartPanelChartProps,
    TCustomViewGridPanel,
    TCustomViewTablePanel,
    TPanel,
    TPanelId,
} from '../../types/panel';
import { EPanelType } from '../../types/panel';

export function createPanel<P extends TPanel>(
    props: { type: TPanel['type'] } & Partial<Omit<P, 'type' | 'panelId'>>,
): P {
    switch (props.type) {
        case EPanelType.Charts:
            return createChartPanel(props) as P;
        case EPanelType.CustomViewTable:
            return createTablePanel(props) as P;
        case EPanelType.CustomViewGrid:
            return createGridPanel(props) as P;
        default:
            assertNever(props.type);
    }
}

/**
 * @public
 */
export function createBasePanel(props?: Partial<Omit<TBasePanel, 'panelId' | 'type'>>): TBasePanel {
    return {
        panelId: createPanelId(),
        layouts: props?.layouts ?? [],
        settings: props?.settings ?? {
            url: `wss://localhost/` as TSocketURL,
        },
    };
}

/**
 * @public
 */
export function createChartPanel(
    props?: Partial<Omit<TChartPanel, 'panelId' | 'type'>>,
): TChartPanel {
    return {
        ...createBasePanel({
            ...props,
            settings: {
                url: 'wss://ms.advsys.work/algo/' as TSocketURL,
                ...props?.settings,
            },
        }),
        type: EPanelType.Charts,
        charts: props?.charts ?? [createChartPanelChartProps(MINIMAL_CHART, 0)],
        levels: props?.levels ?? [],
        schemes: props?.schemes ?? [],
    };
}

/**
 * @public
 */
export function createTablePanel(
    props?: Partial<Omit<TCustomViewTablePanel, 'panelId' | 'type'>>,
): TCustomViewTablePanel {
    return {
        ...createBasePanel({
            ...props,
            settings: {
                url: 'wss://ms.advsys.work/algo/' as TSocketURL,
                ...props?.settings,
            },
        }),
        type: EPanelType.CustomViewTable,
        table: props?.table ?? MINIMAL_TABLE,
    };
}

/**
 * @public
 */
export function createGridPanel(
    props?: Partial<Omit<TCustomViewGridPanel, 'panelId' | 'type'>>,
): TCustomViewGridPanel {
    return {
        ...createBasePanel({
            ...props,
            settings: {
                url: 'wss://ms.advsys.work/algo/' as TSocketURL,
                ...props?.settings,
            },
        }),
        type: EPanelType.CustomViewGrid,
        grid: props?.grid ?? MINIMAL_GRID,
    };
}

export const createPanelId = (): TPanelId => String(getRandomUint32()) as TPanelId;

export function getPanelLabel(
    chart: Pick<TChartPanelChartProps, 'label' | 'query'>,
    defaultLabel?: string,
) {
    return (
        chart.label ||
        // for simple user life
        Promql.tryParseQuery(chart.query)?.labels?.name ||
        defaultLabel ||
        'Unknown'
    );
}

export function createChartPanelChartProps(
    props: Omit<TChartPanelChartProps, 'id'>,
    index: number,
): TChartPanelChartProps {
    const id = hash([
        props.url,
        props.query,
        props.formula,
        props.styler,
        props.color,
        props.opacity,
        props.width,
        index,
    ]) as TSeriesId;

    return { ...props, id };
}

export function getGridCellPositionByIndex(layout: TGridLayout, index: number): TGridCellPosition {
    const x = index % layout.colsCount;
    const y = Math.trunc(index / layout.colsCount);

    return {
        relX: x / layout.colsCount,
        relY: y / layout.rowsCount,
    };
}

export function getPanelIdMarkerComment(id: string): string {
    return `panelId:${id}`;
}

export function getPanelIdFromMarkerComment(comment: string): TPanelId | undefined {
    const result = /^(panelId\:)?(\d+)$/.exec(comment);
    if (isNil(result) || !isFinite(Number(result[2]))) {
        return undefined;
    }

    return result[2] as TPanelId;
}

const MINIMAL_CHART: Omit<TChartPanelChartProps, 'id'> = {
    query: "indicators{name='ETHUSDT|Binance.l1.ask.rep.0.1'}" as TPromqlQuery,
};

const MINIMAL_TABLE: TXmlImportableTable = {
    header: {
        column: [
            {
                text: 'Header2.0',
                width: 100,
            },
            {
                width: 200,
            },
            {
                text: 'Header3',
                width: 100,
            },
            {
                text: 'Header4',
                width: 100,
            },
        ],
    },
    row: {
        cell: [
            {
                text: 'Level 1.1',
            },
            {
                text: 'Level 1.2',
            },
            {
                text: {
                    format: 'ALGO|TEST_RND|01 age: %g seconds',
                    formula: 'age({ALGO|TEST_RND|01})',
                },
            },
            {
                text: {
                    format: 'Base text: %g',
                    formula: '{ALGO|TEST_RND|01}',
                },
            },
        ],
    },
};

const MINIMAL_GRID: TXmlImportableGrid = {
    style: {
        gap: '20px',
    },
    cell: [
        {
            column: 1,
            text: {
                format: 'Base text: %g',
                formula: '{ALGO|TEST_RND|01}',
            },
            mark: {
                style: {
                    color: 'red',
                },
            },
        },
        {
            column: 3,
            text: {
                format: 'Base text: %g',
                formula: '{ALGO|TEST_RND|01}',
            },
            mark: {
                style: {
                    color: 'blue',
                },
            },
        },
        {
            column: 5,
            text: {
                format: 'Base text: %g seconds',
                formula: 'age({ALGO|TEST_RND|01})',
            },
            mark: {
                style: {
                    color: 'purple',
                },
            },
        },
    ],
};
