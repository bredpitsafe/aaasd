import type { TVirtualAccountId } from '../../types/domain/account.ts';
import type { TAssetId } from '../../types/domain/asset.ts';
import type { TInstrumentId } from '../../types/domain/instrument.ts';
import type { TRobotId } from '../../types/domain/robots.ts';

export type {
    TStmBalance,
    TSubscribeToStmBalancesResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmBalances.schema.ts';

export type { TFetchStmBalancesSnapshotResponsePayload } from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchStmBalancesSnapshot.schema.ts';

export type TStmBalanceFilter = Partial<{
    instrumentIds: TInstrumentId[];
    virtualAccountIds: TVirtualAccountId[];
    robotIds: TRobotId[];
    assetIds: TAssetId[];
    nonZeroBalances: boolean;
}>;
