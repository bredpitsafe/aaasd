export type TGridSettings = {
    name: string;
    margin: number;
    colsCount: number;
    rowsCount: number;
    // bad naming, better name - defaultCellSize
    panel: TGridCellSize;
};

export type TGridLayout = {
    name: string;
    colsCount: number;
    rowsCount: number;
};

export type TGridCell = TGridCellPosition & TGridCellSize;

export type TGridCellPosition = {
    relX: number; // 0 -> 1
    relY: number; // 0 -> infinity, but one screen = n -> n + 1
};

type TGridCellSize = {
    relWidth: number; // 0 -> 1
    relHeight: number; // 0 -> 1
    relMinWidth?: number; // 0 -> 1
    relMinHeight?: number; // 0 -> 1
};
