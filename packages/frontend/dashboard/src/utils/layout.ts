import { isNil } from 'lodash-es';
import type { Layout } from 'react-grid-layout';

import type { TGridCell, TGridLayout, TGridSettings } from '../types/layout';
import type { TImportableGridSettings } from '../types/layout/importable';
import type { TPanelGridCell, TPanelId } from '../types/panel';

const DEFAULT_REL_WIDTH = 1 / 6;
const DEFAULT_REL_HEIGHT = 1 / 6;

export const DEFAULT_GRID_CELL: TGridCell = {
    relX: 0,
    relY: 0,
    relWidth: 1,
    relHeight: 1,
    relMinWidth: DEFAULT_REL_WIDTH,
    relMinHeight: DEFAULT_REL_HEIGHT,
};

export function gridCellToLayout(
    colsCount: TGridSettings['colsCount'],
    rowsCount: TGridSettings['rowsCount'],
    cell: TPanelGridCell,
): Layout {
    // Fallback for old structure from localstorage
    // @ts-ignore
    if (typeof cell.i === 'string') {
        // @ts-ignore
        return cell;
    }

    const { round, max } = Math;
    const _x = round(cell.relX * colsCount);
    const x = _x % colsCount;
    const y = round(cell.relY * rowsCount) + (_x - x);

    return {
        i: cell.panelId,
        x,
        y,
        w: max(round(cell.relWidth * colsCount), 1),
        h: max(round(cell.relHeight * rowsCount), 1),
        minW: cell.relMinWidth ? max(round(cell.relMinWidth * colsCount), 1) : undefined,
        minH: cell.relMinHeight ? max(round(cell.relMinHeight * rowsCount), 1) : undefined,
    };
}

export function layoutToGridCell(
    colsCount: TGridSettings['colsCount'],
    rowsCount: TGridSettings['rowsCount'],
    layout: Layout,
): TPanelGridCell {
    return {
        panelId: layout.i as TPanelId,
        relX: layout.x / colsCount,
        relY: layout.y / rowsCount,
        relWidth: layout.w / colsCount,
        relHeight: layout.h / rowsCount,
    };
}

export function getGridRowHeight(
    rowsCount: TGridSettings['rowsCount'],
    margin: TGridSettings['margin'],
    height: number,
): number {
    return (height - margin - rowsCount * margin) / rowsCount;
}

export const grid60x60 = createGridSettingsNxM(60, 60);
export const allDefaultLayouts = [
    createGridLayoutNxM(1, 2),
    createGridLayoutNxM(1, 3),
    createGridLayoutNxM(1, 4),
    createGridLayoutNxM(2, 1),
    createGridLayoutNxM(2, 2),
    createGridLayoutNxM(2, 3),
    createGridLayoutNxM(3, 1),
    createGridLayoutNxM(3, 2),
    createGridLayoutNxM(3, 3),
    createGridLayoutNxM(4, 3),
    createGridLayoutNxM(4, 4),
    createGridLayoutNxM(6, 6),
];

export function grindGridLayout(layout: Omit<TGridLayout, 'name'>): TGridLayout {
    if (
        grid60x60.colsCount % layout.colsCount === 0 &&
        grid60x60.rowsCount % layout.rowsCount === 0
    ) {
        return grid60x60;
    }

    function greatestCommonDivisor(n: number, m: number): number {
        return m == 0 ? n : greatestCommonDivisor(m, n % m);
    }

    function leastCommonMultiple(n: number, m: number): number {
        return (n * m) / greatestCommonDivisor(n, m);
    }

    return createGridLayoutNxM(
        leastCommonMultiple(grid60x60.colsCount, layout.colsCount),
        leastCommonMultiple(grid60x60.rowsCount, layout.rowsCount),
    );
}

export function createDefaultGridCellSize(
    gridColsCount: number,
    gridRowsCount: number,
    relMinWidth?: number,
    relMinHeight?: number,
): TGridSettings['panel'] {
    const { floor, ceil } = Math;

    const expectedRelWidth = 1 / gridColsCount;
    const expectedRelHeight = 1 / gridRowsCount;

    const resizedWidth = expectedRelWidth < DEFAULT_REL_WIDTH;
    const resizedHeight = expectedRelHeight < DEFAULT_REL_HEIGHT;

    const rescaleCellsX = resizedWidth ? ceil(DEFAULT_REL_WIDTH / expectedRelWidth) : 1;
    const rescaleCellsY = resizedHeight ? ceil(DEFAULT_REL_HEIGHT / expectedRelHeight) : 1;

    const colsCount = resizedWidth ? floor(gridColsCount / rescaleCellsX) : gridColsCount;
    const rowsCount = resizedHeight ? floor(gridRowsCount / rescaleCellsY) : gridRowsCount;

    const newRelMinWidth = relMinWidth ?? expectedRelWidth * rescaleCellsX;
    const newRelMinHeight = relMinHeight ?? expectedRelHeight * rescaleCellsY;

    const relWidth =
        gridColsCount % colsCount === 0
            ? expectedRelWidth * (gridColsCount / colsCount)
            : newRelMinWidth;
    const relHeight =
        gridRowsCount % rowsCount === 0
            ? expectedRelHeight * (gridRowsCount / rowsCount)
            : newRelMinHeight;

    return { relWidth, relHeight, relMinWidth: newRelMinWidth, relMinHeight: newRelMinHeight };
}

export function createGridSettingsByImportableSettings(
    gridSettings: undefined | Partial<TImportableGridSettings>,
): TGridSettings {
    if (isNil(gridSettings) || isNil(gridSettings.colsCount) || isNil(gridSettings.rowsCount)) {
        return grid60x60;
    }

    const layout = grindGridLayout({
        colsCount: gridSettings.colsCount,
        rowsCount: gridSettings.rowsCount,
    });

    return {
        name: gridSettings.name ?? layout.name,
        margin: 4,
        colsCount: layout.colsCount,
        rowsCount: layout.rowsCount,
        panel: createDefaultGridCellSize(
            layout.colsCount,
            layout.rowsCount,
            gridSettings.panel?.relMinWidth,
            gridSettings.panel?.relMinHeight,
        ),
    };
}

export function createGridSettingsByLayout(layout: TGridLayout): TGridSettings {
    return {
        ...layout,
        margin: 4,
        panel: createDefaultGridCellSize(layout.colsCount, layout.rowsCount),
    };
}

function createGridSettingsNxM(n: number, m: number): TGridSettings {
    return createGridSettingsByLayout(createGridLayoutNxM(n, m));
}

export function createGridLayoutNxM(n: number, m: number): TGridLayout {
    return {
        name: `${n}x${m}`,
        colsCount: n,
        rowsCount: m,
    };
}

export function visualOrderCellComparer<T extends TGridCell>(a: T, b: T): number {
    return a.relY !== b.relY ? a.relY - b.relY : a.relX - b.relX;
}

export function getLastCellLayout<T extends TGridCell>(layouts: T[]): undefined | T {
    return layouts.sort(visualOrderCellComparer).at(-1);
}

export function getNextLayout(baseCell: undefined | TGridCell) {
    return isNil(baseCell)
        ? DEFAULT_GRID_CELL
        : {
              relX: 0,
              relY: baseCell.relY + baseCell.relHeight,
              relWidth: baseCell.relWidth,
              relHeight: baseCell.relHeight,
              relMinWidth: baseCell.relMinWidth,
              relMinHeight: baseCell.relMinHeight,
          };
}
