import { TActorSocketKey } from '../../def/actor.ts';
import { Response } from '../../def/response.ts';

export type TCloseParams = {
    traceId?: Response['traceId'];
    correlationId?: Response['correlationId'];
    socketKey: TActorSocketKey;
};

export type TSendParams = Pick<Response, 'state' | 'payload' | 'error'> & TCloseParams;
