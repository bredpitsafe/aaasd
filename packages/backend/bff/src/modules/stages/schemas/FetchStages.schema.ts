import { TStages } from '../../../def/stages.ts';

export type TFetchStagesRequestPayload = {
    type: 'FetchStages';
};

export type TFetchStagesResponsePayload = {
    type: 'Stages';
    stages: TStages;
};
