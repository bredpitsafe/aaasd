import { TFetchConvertRatesSnapshotResponsePayload } from '@bhft/bff/src/modules/tradingDataProvider/schemas/FetchConvertRatesSnapshot.schema.ts';

export type TConvertRateItem = TFetchConvertRatesSnapshotResponsePayload['snapshot'][number];
