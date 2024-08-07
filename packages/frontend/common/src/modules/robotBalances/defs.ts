import type { TVirtualAccountId } from '../../types/domain/account';
import type { TAssetId } from '../../types/domain/asset';
import type { TInstrumentId } from '../../types/domain/instrument';
import type { TRobotId } from '../../types/domain/robots';

export type {
    TStmBalance,
    TSubscribeToStmBalancesResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmBalances.schema';
export type { TFetchStmBalancesSnapshotResponsePayload } from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchStmBalancesSnapshot.schema';

export type TStmBalanceFilter = Partial<{
    instrumentIds: TInstrumentId[];
    virtualAccountIds: TVirtualAccountId[];
    robotIds: TRobotId[];
    assetIds: TAssetId[];
    nonZeroBalances: boolean;
}>;
