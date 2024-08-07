import type { Nil } from '@common/types';
import {
    EInternalTransfersTabSelectors,
    InternalTransfersTabTabProps,
} from '@frontend/common/e2e/selectors/balance-monitor/components/internal-transfers/internal-transfers.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import type {
    TAmount,
    TCoinConvertRate,
    TCoinId,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { FormikProps } from 'formik';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { CoinWithIcon } from '../../../CoinWithIcon';
import { LOW_BALANCE_USD_AMOUNT } from '../../../Settings/hooks/defs';
import { DEFAULT_FILTER_OPTION, formatAmountOrEmpty } from '../../../utils';
import type { TInternalTransferFormProps } from '../defs';
import { BALANCE_DISPLAY_AMOUNT_DIGITS } from '../defs';
import type { TSubAccountWithSections } from '../hooks/useSubAccountsWithSections';
import { getIntersectionCoins } from '../utils';
import { INITIAL_VALUES } from '../view';
import { cnCoinBalance, cnCoinWithBalance } from '../view.css';
import { BalancesContext } from './BalancesContext';

export const CoinSelector = memo(
    ({
        formik: { values, resetForm, validateForm },
        subAccountsWithSections,
        balancesByCoin,
        convertRates,
        showLowBalanceCoins,
    }: {
        formik: FormikProps<Partial<TInternalTransferFormProps>>;
        subAccountsWithSections: undefined | TSubAccountWithSections[];
        balancesByCoin: undefined | Record<TCoinId, TAmount>;
        convertRates: Nil | ReadonlyMap<TCoinId, TCoinConvertRate>;
        showLowBalanceCoins: boolean;
    }) => {
        const { fromSubAccount, fromSection, toSubAccount, toSection } = values;

        const coins = useMemo(() => {
            const allCoins = getIntersectionCoins(
                fromSubAccount,
                fromSection,
                toSubAccount,
                toSection,
                subAccountsWithSections,
            );

            if (isNil(allCoins) || showLowBalanceCoins || isNil(balancesByCoin)) {
                return allCoins;
            }

            return allCoins.filter((coin) => {
                const balance = balancesByCoin[coin];

                if (isNil(balance)) {
                    return true;
                }

                if (balance === 0) {
                    return false;
                }

                const rate = convertRates?.get(coin)?.rate;

                if (isNil(rate)) {
                    return true;
                }

                return balance * rate >= LOW_BALANCE_USD_AMOUNT;
            });
        }, [
            fromSubAccount,
            fromSection,
            toSubAccount,
            toSection,
            subAccountsWithSections,
            balancesByCoin,
            convertRates,
            showLowBalanceCoins,
        ]);

        const coinOptions = useMemo(
            () =>
                isNil(coins) || coins.length === 0
                    ? undefined
                    : coins.sort().map((coin) => ({
                          label: (
                              <div className={cnCoinWithBalance}>
                                  <CoinWithIcon coin={coin} />
                                  <BalancesContext.Consumer>
                                      {(balancesByCoin: Record<TCoinId, TAmount> | undefined) => {
                                          if (isNil(balancesByCoin)) {
                                              return null;
                                          }

                                          return (
                                              <span className={cnCoinBalance}>
                                                  {formatAmountOrEmpty(
                                                      balancesByCoin?.[coin],
                                                      BALANCE_DISPLAY_AMOUNT_DIGITS,
                                                  )}
                                              </span>
                                          );
                                      }}
                                  </BalancesContext.Consumer>
                              </div>
                          ),
                          value: coin,
                      })),
            [coins],
        );

        const handleCoinChange = useFunction((coin: TCoinId | undefined) => {
            const { mainAccount, fromSubAccount, fromSection, toSubAccount, toSection } = values;

            resetForm({
                values: {
                    ...INITIAL_VALUES,
                    mainAccount,
                    fromSubAccount,
                    fromSection,
                    toSubAccount,
                    toSection,
                    coin,
                },
            });
            void validateForm();
        });

        return (
            <FormikForm.Item name="coin" label="Coin">
                <BalancesContext.Provider value={balancesByCoin}>
                    <FormikSelect
                        {...InternalTransfersTabTabProps[
                            EInternalTransfersTabSelectors.CoinSelector
                        ]}
                        name="coin"
                        showSearch
                        options={coinOptions}
                        allowClear
                        disabled={isEmpty(coinOptions)}
                        onChange={handleCoinChange}
                        filterOption={DEFAULT_FILTER_OPTION}
                    />
                </BalancesContext.Provider>
            </FormikForm.Item>
        );
    },
);
