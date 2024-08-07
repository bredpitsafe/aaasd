import type { TRemoteProcedureDescriptor } from '@common/rpc';
import type { TStructurallyCloneable } from '@common/types';
import type { Observable } from 'rxjs';

import type { TReceivedData } from '../../lib/BFFSocket/def';
import type { THandlerStreamOptions, TWithTraceId } from '../../modules/actions/def.ts';
import type { TSocketStruct, TSocketURL } from '../../types/domain/sockets';
import type { TValueDescriptor2 } from '../ValueDescriptor/types';
import type { EPlatformSocketRemoteProcedureName } from './defs';

export type TPlatformSocketParams<P extends TStructurallyCloneable> = {
    params: P & { target: TSocketURL | TSocketStruct };
    options: TPlatformSocketOptions;
};

export type TPlatformSocketReceive<T extends TStructurallyCloneable> = TValueDescriptor2<
    TReceivedData<T>
>;
export type TPlatformSocketOptions = TWithTraceId &
    Pick<THandlerStreamOptions, 'enableLogs' | 'enableRetries' | 'skipAuthentication'>;

export type TActorParams<P extends TStructurallyCloneable> = {
    params: P;
    options: TActorOptions;
};
export type TActorReceive<T extends TStructurallyCloneable> = TValueDescriptor2<T>;

export type TActorOptions = TWithTraceId & {
    enableLogs?: boolean;
    enableRetries?: boolean;
};

export type ExtractTransportParams<D> = D extends TRemoteProcedureDescriptor<
    infer Name,
    infer Send,
    any
>
    ? Name extends EPlatformSocketRemoteProcedureName
        ? TPlatformSocketParams<Send>
        : TActorParams<Send>
    : never;

export type ExtractParams<D> = D extends TRemoteProcedureDescriptor<infer Name, infer Send, any>
    ? (Name extends EPlatformSocketRemoteProcedureName
          ? TPlatformSocketParams<Send>
          : TActorParams<Send>)['params']
    : never;

export type ExtractOptions<D> = D extends TRemoteProcedureDescriptor<infer Name, any, any>
    ? Name extends EPlatformSocketRemoteProcedureName
        ? TPlatformSocketOptions
        : TActorOptions
    : never;

export type ExtractReceive<D> = D extends TRemoteProcedureDescriptor<infer Name, any, infer Receive>
    ? Name extends EPlatformSocketRemoteProcedureName
        ? TPlatformSocketReceive<Receive>
        : TActorReceive<Receive>
    : never;

export type ExtractTransport<D extends TRemoteProcedureDescriptor<any, any, any>> = (
    args: ExtractTransportParams<D>,
) => Observable<ExtractReceive<D>>;
