import type {
    TAmount,
    TBalanceMonitorAccountId,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

export type TManualTransferFormProps = {
    coin: TCoinId;
    from: TBalanceMonitorAccountId;
    to: TBalanceMonitorAccountId;
    amount: TAmount;
};

export type TManualTransferFormData = {
    coin?: TCoinId;
    from?: TBalanceMonitorAccountId;
    to?: TBalanceMonitorAccountId;
    amount?: TAmount;
    disableCoinSelection?: boolean;
    disableSourceSelection?: boolean;
    disableDestinationSelection?: boolean;
    disableAmountSelection?: boolean;
};

export const MANUAL_EDIT_AMOUNT_DIGITS = 2;
