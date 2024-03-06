import { TAccountCredentials, TRealAccount } from '../../types/domain/account';

type TUpdatableAccountCredentials = Omit<TAccountCredentials, 'id'> & {
    id?: TAccountCredentials['id'];
};

export enum EAccountCredentialsUpdateActions {
    Set = 'Set',
    KeepExisting = 'KeepExisting',
}

type TUpdatableAccountCredentialsSendBody = Omit<
    TUpdatableAccountCredentials,
    'secret' | 'passphrase'
> & {
    secret: TUpdatableAccountSecret;
    passphrase: TUpdatableAccountSecret;
};

export type TUpdatableRealAccountSendBody = Omit<TUpdatableRealAccount, 'credentials'> & {
    credentials: TUpdatableAccountCredentialsSendBody[];
};

export type TUpdatableAccountSecret =
    | { [EAccountCredentialsUpdateActions.Set]: string | null }
    | EAccountCredentialsUpdateActions.KeepExisting;

export type TUpdatableRealAccount = Partial<Omit<TRealAccount, 'id' | 'name' | 'credentials'>> & {
    id?: TAccountCredentials['id'];
    name: TRealAccount['name'];
    credentials: TUpdatableAccountCredentials[];
};

export const ACCOUNT_SECRET = '<secret>';
