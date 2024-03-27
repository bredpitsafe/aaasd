import type {
    TAmount,
    TBalanceMonitorAccountId,
    TBalanceMonitorSubAccountId,
    TBalanceMonitorSubAccountSectionId,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

export type TInternalTransferFormProps = {
    mainAccount: TBalanceMonitorAccountId;
    fromSubAccount: TBalanceMonitorSubAccountId;
    fromSection: TBalanceMonitorSubAccountSectionId;
    toSubAccount: TBalanceMonitorSubAccountId;
    toSection: TBalanceMonitorSubAccountSectionId;
    coin: TCoinId;
    amount: TAmount;
};

export const BALANCE_DISPLAY_AMOUNT_DIGITS = 5;
