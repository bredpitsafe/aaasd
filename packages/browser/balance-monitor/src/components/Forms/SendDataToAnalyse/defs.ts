import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';

export type TSaveCoinStateFormValues = {
    coin: TCoinId;
    comment: string;
};
