import { Opaque } from '../index';

export type TSocketStruct = {
    name: TSocketName;
    url: TSocketURL;
};

export type TSocketName = Opaque<'SocketName', string>;
export type TSocketURL = Opaque<'SocketURL', string>;
export type TSocketMap = Record<TSocketName, TSocketURL>;

export enum ESocketType {
    Development = 'dev',
    Production = 'prod',
}
