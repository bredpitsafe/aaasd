import type { TVirtualAccountId } from '../../types/domain/account';
import type { TInstrumentId } from '../../types/domain/instrument';
import type { TRobotId } from '../../types/domain/robots';

export type {
    TStmPosition,
    TSubscribeToStmPositionsResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmPositions.schema';
export type { TFetchStmPositionsSnapshotResponsePayload } from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchStmPositionsSnapshot.schema';

export type TStmPositionFilter = Partial<{
    instrumentIds: TInstrumentId[];
    virtualAccountIds: TVirtualAccountId[];
    robotIds: TRobotId[];
    nonZeroPositions: boolean;
}>;
