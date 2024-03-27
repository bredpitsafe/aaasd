import type {
    TCoinId,
    TExchangeId,
    TExchangeInfo,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';

export type TPlainExchangeStats = TExchangeInfo & {
    coin: TCoinId;
    exchangeName: TExchangeId;
};
