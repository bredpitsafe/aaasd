import type { TStageName } from '@backend/bff/src/def/stages.ts';
import type { Opaque } from '@common/types';

export type TSocketStruct = {
    name: TSocketName;
    url: TSocketURL;
};

export type TSocketName = Opaque<'SocketName', string> | TStageName;
export type TSocketURL = Opaque<'SocketURL', string>;
export type TSocketMap = Record<TSocketName, TSocketURL>;
export type TWithSocketTarget = { target: TSocketURL | TSocketStruct };

export enum ESocketType {
    Development = 'dev',
    Production = 'prod',
}
