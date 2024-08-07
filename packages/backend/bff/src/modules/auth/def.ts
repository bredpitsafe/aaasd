import type { TRpcApi } from '../../def/rpc.ts';
import type {
    TAuthenticateRequestPayload,
    TAuthenticateResponsePayload,
} from './schemas/Authenticate.schema.ts';
import type { TLogoutRequestPayload, TLogoutResponsePayload } from './schemas/Logout.schema.ts';

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
