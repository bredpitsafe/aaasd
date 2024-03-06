import { Observable } from 'rxjs';

import { THandlerStreamOptions, TWithTraceId } from '../../handlers/def';
import { TReceivedData } from '../../lib/BFFSocket/def';
import { TSocketStruct, TSocketURL } from '../../types/domain/sockets';
import { TStructurallyCloneable } from '../../types/serialization';
import { TValueDescriptor2 } from '../ValueDescriptor/types';
import { ERemoteProcedureType, EServerRemoteProcedureName } from './defs';

export type TWebSocketParams<P extends TStructurallyCloneable> = {
    params: P & { target: TSocketURL | TSocketStruct };
    options: TWebSocketOptions;
};

export type TWebSocketReceive<T extends TStructurallyCloneable> = TValueDescriptor2<
    TReceivedData<T>
>;
export type TWebSocketOptions = TWithTraceId &
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

export type TRemoteProcedureDescriptor<
    Name extends string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Send extends TStructurallyCloneable,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    Receive extends TStructurallyCloneable,
> = {
    name: Name;
    type: ERemoteProcedureType;
};

export type ExtractTransportParams<D> = D extends TRemoteProcedureDescriptor<
    infer Name,
    infer Send,
    any
>
    ? Name extends EServerRemoteProcedureName
        ? TWebSocketParams<Send>
        : TActorParams<Send>
    : never;

export type ExtractParams<D> = D extends TRemoteProcedureDescriptor<infer Name, infer Send, any>
    ? (Name extends EServerRemoteProcedureName
          ? TWebSocketParams<Send>
          : TActorParams<Send>)['params']
    : never;

export type ExtractOptions<D> = D extends TRemoteProcedureDescriptor<infer Name, any, any>
    ? Name extends EServerRemoteProcedureName
        ? TWebSocketOptions
        : TActorOptions
    : never;

export type ExtractReceive<D> = D extends TRemoteProcedureDescriptor<infer Name, any, infer Receive>
    ? Name extends EServerRemoteProcedureName
        ? TWebSocketReceive<Receive>
        : TActorReceive<Receive>
    : never;

export type ExtractTransport<D extends TRemoteProcedureDescriptor<any, any, any>> = (
    args: ExtractTransportParams<D>,
) => Observable<ExtractReceive<D>>;
