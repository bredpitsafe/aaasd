import { IAccount } from '../../../lib/interfaces/trading-servers-manager/acccount-interfaces';

export function createAutotestAccount(): IAccount {
    return {
        idRealAccountRowText: '1500',
        idVirtualAccountRowText: '321',
        userRealAccountNameRowText: 'AutotestRealAccount',
        userVirtualAccountNameRowText: 'AutotestVirtualAccount',
        exchangeAccountIDText: 'AutotestExchangeAccountID',
        nameRowText: 'AutotestName',
        keyRowText: 'AutotestKey',
        secretRowText: 'secret',
        passphraseRowText: 'secret',
    };
}
