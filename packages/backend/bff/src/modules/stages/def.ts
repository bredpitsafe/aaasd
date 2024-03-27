import { TRpcApi } from '../../def/rpc.ts';
import {
    TFetchStagesRequestPayload,
    TFetchStagesResponsePayload,
} from './schemas/FetchStages.schema.ts';

export enum EStagesRouteName {
    FetchStages = 'FetchStages',
}

export type TStagesRoutesMap = {
    [EStagesRouteName.FetchStages]: TRpcApi<
        TFetchStagesRequestPayload,
        TFetchStagesResponsePayload
    >;
};
