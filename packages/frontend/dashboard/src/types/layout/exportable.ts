export type TExportableGridSettings = {
    name: string;
    margin: number;
    colsCount: number;
    rowsCount: number;
    panel: TExportableGridCellSize;
};

export type TExportableGridCell = TExportableGridCellPosition & TExportableGridCellSize;

type TExportableGridCellPosition = {
    /** Relative position by X axis [0, 1] */
    relX: number; // 0 -> 1
    /** Relative position by Y axis [0, Infinity], but one screen = n -> n + 1 */
    relY: number;
};

type TExportableGridCellSize = {
    relWidth: number;
    relHeight: number;
    relMinWidth?: number;
    relMinHeight?: number;
};
