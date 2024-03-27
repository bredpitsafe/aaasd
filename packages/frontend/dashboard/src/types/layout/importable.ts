export type TImportableGridSettings = {
    name: string;
    /** Grid cell margin */
    margin: number;
    /** Columns count */
    colsCount: number;
    /** Rows count */
    rowsCount: number;
    // bad naming, better name - defaultCellSize
    panel: TImportableGridCellSize;
};

export type TImportableGridCell = TImportableGridCellPosition & TImportableGridCellSize;

type TImportableGridCellPosition = {
    /** Relative position by X axis [0, 1] */
    relX: number; // 0 -> 1
    /** Relative position by Y axis [0, Infinity], but one screen = n -> n + 1 */
    relY: number;
};

type TImportableGridCellSize = {
    /** Relative width [0, 1] */
    relWidth: number;
    /** Relative height [0, 1] */
    relHeight: number;
    /** Relative maximum width [0, 1] */
    relMinWidth?: number;
    /** Relative minimal height [0, 1] */
    relMinHeight?: number;
};
