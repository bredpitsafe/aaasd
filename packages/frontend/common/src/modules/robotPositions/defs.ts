import type { TVirtualAccountId } from '../../types/domain/account.ts';
import type { TInstrumentId } from '../../types/domain/instrument.ts';
import type { TRobotId } from '../../types/domain/robots.ts';

export type {
    TStmPosition,
    TSubscribeToStmPositionsResponsePayload,
} from '@backend/bff/src/modules/tradingDataProvider/schemas/SubscribeToStmPositions.schema.ts';

export type { TFetchStmPositionsSnapshotResponsePayload } from '@backend/bff/src/modules/tradingDataProvider/schemas/FetchStmPositionsSnapshot.schema.ts';

export type TStmPositionFilter = Partial<{
    instrumentIds: TInstrumentId[];
    virtualAccountIds: TVirtualAccountId[];
    robotIds: TRobotId[];
    nonZeroPositions: boolean;
}>;
