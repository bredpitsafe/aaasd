import type {
    TCoinConvertRate,
    TCoinTransferDetailsItem,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

export type TCoinTransferDetailsWithId = TCoinTransferDetailsItem & {
    rowId: string;
    convertRate?: TCoinConvertRate;
};

export const TRANSFER_DETAILS_AMOUNT_DIGITS = undefined;
