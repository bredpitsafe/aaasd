import type {
    TAmount,
    TCoinId,
    TExchangeId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

export type TGatheringFormProps = {
    exchange: TExchangeId;
    coin: TCoinId;
    amount: TAmount;
};

export const MANUAL_EDIT_AMOUNT_DIGITS = 2;
