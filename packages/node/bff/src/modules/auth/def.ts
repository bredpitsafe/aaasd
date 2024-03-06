import { TRpcApi } from '../../def/rpc.ts';
import {
    TAuthenticateRequestPayload,
    TAuthenticateResponsePayload,
} from './schemas/Authenticate.schema.ts';
import { TLogoutRequestPayload, TLogoutResponsePayload } from './schemas/Logout.schema.ts';

export enum EAuthRouteName {
    Authenticate = 'Authenticate',
    Logout = 'Logout',
}

export type TAuthRoutesMap = {
    [EAuthRouteName.Authenticate]: TRpcApi<
        TAuthenticateRequestPayload,
        TAuthenticateResponsePayload
    >;
    [EAuthRouteName.Logout]: TRpcApi<TLogoutRequestPayload, TLogoutResponsePayload>;
};
