import type { Opaque } from '@common/types';

export type TVirtualAccountId = Opaque<'VirtualAccountId', number>;
export type TAccountId = Opaque<'AccountId', number>;

export type TVirtualAccount = {
    id: TVirtualAccountId;
    name: string;
    digest: string;
    isDirty: boolean;
    isInternal: boolean;
    realAccounts: Pick<TRealAccount, 'id' | 'name'>[];
};

export type TAccountCredentials = {
    id: number;
    name: string;
    key: string;
    secret: string;
    passphrase: string | null;
    isInternal: boolean;
};

export type TRealAccount = {
    id: TAccountId;
    name: string;
    digest: string;
    isDirty: boolean;
    credentials: TAccountCredentials[];
    exchangeAccountId: string | null;
    isInternal: boolean;
};

export type TNestedVirtualAccount = Omit<TVirtualAccount, 'realAccounts'> & {
    realAccounts: TRealAccount[];
};
