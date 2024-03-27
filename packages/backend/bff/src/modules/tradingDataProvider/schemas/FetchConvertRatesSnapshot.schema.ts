import { Assign, InterfaceToType } from '@backend/utils/src/util-types.ts';
import type {
    FetchConvertRatesSnapshotRequest,
    FetchConvertRatesSnapshotResponse,
} from '@bhft/trading_data_provider-api-sdk/index.services.trading_data_provider.v1.js';
import type { RequiredDeep } from 'type-fest';

import { WithRequestStage } from '../../../def/stages.ts';

export type TFetchConvertRatesSnapshotRequestPayload = InterfaceToType<
    WithRequestStage<
        Assign<
            FetchConvertRatesSnapshotRequest,
            {
                type: 'FetchConvertRatesSnapshot';
            }
        >
    >
>;

export type TFetchConvertRatesSnapshotResponsePayload = InterfaceToType<
    Assign<
        RequiredDeep<FetchConvertRatesSnapshotResponse>,
        {
            type: 'ConvertRatesSnapshot';
        }
    >
>;
