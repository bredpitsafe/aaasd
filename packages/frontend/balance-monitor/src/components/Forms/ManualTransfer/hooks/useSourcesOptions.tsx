import type {
    TBalanceMonitorAccountId,
    TTransfer,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import cn from 'classnames';
import { isEmpty, isNil, sortBy, uniqBy } from 'lodash-es';
import { useMemo } from 'react';

import { AccountWithExchangeIcon } from '../../../AccountWithExchangeIcon';
import type { TManualTransferFormProps } from '../defs';
import { cnTransferExists } from '../view.css';

export function useSourcesOptions(
    transfers: TTransfer[],
    values: Partial<TManualTransferFormProps>,
    hasTransfer: (
        source: TBalanceMonitorAccountId,
        destination: TBalanceMonitorAccountId,
    ) => boolean,
) {
    return useMemo(
        () =>
            isEmpty(transfers)
                ? []
                : sortBy(
                      uniqBy(
                          transfers.map(({ from }) => from),
                          ({ account }) => account,
                      ),
                      ({ account }) => account,
                  ).map(({ account, exchange }) => ({
                      label: (
                          <AccountWithExchangeIcon
                              className={cn({
                                  [cnTransferExists]:
                                      !isNil(values.to) &&
                                      hasTransfer(account, values.to) &&
                                      account !== values.from,
                              })}
                              account={account}
                              exchange={exchange}
                          />
                      ),
                      value: account,
                  })),
        [values.to, values.from, hasTransfer, transfers],
    );
}
