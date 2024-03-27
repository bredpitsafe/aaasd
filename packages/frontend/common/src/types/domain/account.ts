import { Opaque } from '../index';

export type TVirtualAccountId = Opaque<'VirtualAccountId', number>;
export type TAccountId = Opaque<'AccountId', number>;

export type TVirtualAccount = {
    id: TVirtualAccountId;
    name: string;
    digest: string;
    isDirty: boolean;
    realAccounts: Pick<TRealAccount, 'id' | 'name'>[];
};

export type TAccountCredentials = {
    id: number;
    name: string;
    key: string;
    secret: string;
    passphrase: string | null;
};

export type TRealAccount = {
    id: TAccountId;
    name: string;
    digest: string;
    isDirty: boolean;
    credentials: TAccountCredentials[];
    exchangeAccountId: string | null;
};

export type TNestedVirtualAccount = Omit<TVirtualAccount, 'realAccounts'> & {
    realAccounts: TRealAccount[];
};
