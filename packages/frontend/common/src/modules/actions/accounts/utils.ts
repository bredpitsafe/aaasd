import type {
    TUpdatableAccountSecret,
    TUpdatableRealAccount,
    TUpdatableRealAccountSendBody,
} from './def.ts';
import { ACCOUNT_SECRET, EAccountCredentialsUpdateActions } from './def.ts';

export function getSendBodyAccounts(
    accounts: TUpdatableRealAccount[],
): TUpdatableRealAccountSendBody[] {
    return accounts.map(({ credentials, ...acc }) => ({
        ...acc,
        credentials: credentials.map((cred) => {
            return {
                ...cred,
                secret: getUpdatableAccountSecret(cred.secret),
                passphrase: getUpdatableAccountSecret(cred.passphrase),
            };
        }),
    }));
}
function getUpdatableAccountSecret(value: string | null | undefined): TUpdatableAccountSecret {
    if (value === ACCOUNT_SECRET) {
        return EAccountCredentialsUpdateActions.KeepExisting;
    }
    return { [EAccountCredentialsUpdateActions.Set]: value ? value : null };
}
