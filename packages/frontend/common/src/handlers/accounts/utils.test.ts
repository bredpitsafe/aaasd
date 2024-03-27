import { ACCOUNT_SECRET, TUpdatableRealAccount } from './def';
import { getSendBodyAccounts } from './utils';

const CREDENTIALS = {
    name: 'name',
    key: 'key',
    secret: 'secret',
    passphrase: 'passphrase',
};

const RESET_CREDENTIALS = { ...CREDENTIALS, secret: '', passphrase: null };
const KEEP_CREDENTIALS = { ...CREDENTIALS, secret: ACCOUNT_SECRET, passphrase: ACCOUNT_SECRET };

const ACCOUNT: TUpdatableRealAccount = {
    credentials: [CREDENTIALS],
    name: 'test',
};

describe('accounts handlers utils', () => {
    describe('getSendBodyAccounts', () => {
        it('set new field value', () => {
            expect(getSendBodyAccounts([ACCOUNT])).toMatchSnapshot();
        });

        it('reset field value', () => {
            const ACCOUNT_RESET_FIELDS = {
                ...ACCOUNT,
                credentials: [RESET_CREDENTIALS],
            };

            expect(getSendBodyAccounts([ACCOUNT_RESET_FIELDS])).toMatchSnapshot();
        });

        it('keep field value', () => {
            const ACCOUNT_KEEP_FIELDS = {
                ...ACCOUNT,
                credentials: [KEEP_CREDENTIALS],
            };

            expect(getSendBodyAccounts([ACCOUNT_KEEP_FIELDS])).toMatchSnapshot();
        });
    });
});
