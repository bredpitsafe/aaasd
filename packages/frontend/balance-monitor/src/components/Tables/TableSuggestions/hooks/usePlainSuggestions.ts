import type {
    TCoinBalanceReconciliationSuggest,
    TCoinConvertRate,
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ESuggestProblemKind } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isInProgressBalanceReconciliationStep } from '@frontend/common/src/types/domain/balanceMonitor/guards';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    isFailValueDescriptor,
    isRequestingValueDescriptor,
    isUnsyncedValueDescriptor,
    RECEIVING_VD,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { sortBy } from 'lodash-es';
import { useMemo } from 'react';

import type { TCoinInfoDescriptor } from '../../../../modules/actions/ModuleSubscribeToCoinInfoOnCurrentStage.ts';
import type { TConvertRatesDescriptor } from '../../../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import type { TSuggestionsDescriptor } from '../../../../modules/actions/ModuleSubscribeToCurrentSuggestions.ts';
import { roundAmount } from '../../../utils';
import type { TPlainSuggestion } from '../defs';
import { EAmountNotification, EPlainSuggestionGroup, SUGGEST_AMOUNT_DIGITS } from '../defs';
import { getSuggestHash, getSuggestKey } from '../utils';

type TPlainSuggestionsDescriptor = TValueDescriptor2<TPlainSuggestion[]>;

export function usePlainSuggestions(
    suggestionsDescriptor: TSuggestionsDescriptor,
    coinInfoDescriptor: TCoinInfoDescriptor,
    convertRatesDescriptor: TConvertRatesDescriptor,
): TPlainSuggestionsDescriptor {
    return useMemo(() => {
        if (
            isUnsyncedValueDescriptor(suggestionsDescriptor) ||
            isUnsyncedValueDescriptor(coinInfoDescriptor) ||
            isUnsyncedValueDescriptor(convertRatesDescriptor)
        ) {
            if (isFailValueDescriptor(suggestionsDescriptor)) {
                return suggestionsDescriptor;
            }
            if (isFailValueDescriptor(coinInfoDescriptor)) {
                return coinInfoDescriptor;
            }
            if (isFailValueDescriptor(convertRatesDescriptor)) {
                return convertRatesDescriptor;
            }

            if (
                isRequestingValueDescriptor(suggestionsDescriptor) ||
                isRequestingValueDescriptor(coinInfoDescriptor) ||
                isRequestingValueDescriptor(convertRatesDescriptor)
            ) {
                return RECEIVING_VD;
            }

            return WAITING_VD;
        }

        return createSyncedValueDescriptor(
            mapSuggestionsToPlainSuggestions(
                suggestionsDescriptor.value,
                coinInfoDescriptor.value,
                convertRatesDescriptor.value,
            ),
        );
    }, [suggestionsDescriptor, coinInfoDescriptor, convertRatesDescriptor]);
}

const FUTURE_TRANSITS = [
    ESuggestProblemKind.APrepareTransitIn,
    ESuggestProblemKind.APrepareTransitOut,
];

function mapSuggestionsToPlainSuggestions(
    coinSuggestionsList: TCoinBalanceReconciliationSuggest[],
    coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>,
    convertRates: ReadonlyMap<TCoinId, TCoinConvertRate>,
): TPlainSuggestion[] {
    return sortBy(coinSuggestionsList, ({ coin }) => coin).reduce((acc, coinSuggestions) => {
        coinSuggestions.suggests.forEach((suggest) => {
            // TODO: Temporary solution requested by back ATF developers
            const fixedAmount = roundAmount(suggest.solution.amount, SUGGEST_AMOUNT_DIGITS);

            const commonPart = {
                suggestHash: getSuggestHash(
                    coinSuggestions.coin,
                    suggest.solution.source.account,
                    suggest.solution.destination.account,
                    fixedAmount,
                ),
                coin: coinSuggestions.coin,
                problemKind: suggest.problemKind,
                sourceExchange: suggest.solution.source.exchange,
                source: suggest.solution.source.account,
                destinationExchange: suggest.solution.destination.exchange,
                destination: suggest.solution.destination.account,
                network: suggest.solution.network,
                amount: fixedAmount,
                convertRate: convertRates.get(coinSuggestions.coin),
                initialBalances: suggest.initialBalances,
                amountNotification: EAmountNotification.None,
                original: {
                    sourceExchange: suggest.solution.source.exchange,
                    source: suggest.solution.source.account,
                    destinationExchange: suggest.solution.destination.exchange,
                    destination: suggest.solution.destination.account,
                    amount: fixedAmount,
                    amountNotification: EAmountNotification.None,
                },
            };

            if (isInProgressBalanceReconciliationStep(suggest.solution)) {
                acc.push({
                    key: `ID: ${suggest.solution.id}`,

                    group: EPlainSuggestionGroup.InProgress,

                    ...commonPart,

                    id: suggest.solution.id,
                    status: suggest.solution.status,
                });
            } else {
                if (FUTURE_TRANSITS.includes(suggest.problemKind)) {
                    acc.push({
                        ...commonPart,

                        key: getSuggestKey(
                            coinSuggestions.coin,
                            suggest.solution.source.account,
                            suggest.solution.destination.account,
                            EPlainSuggestionGroup.Future,
                        ),
                        group: EPlainSuggestionGroup.Future,
                    });
                } else {
                    const fullInfoByCoin = coinInfo.get(coinSuggestions.coin);

                    acc.push({
                        ...commonPart,

                        key: getSuggestKey(
                            coinSuggestions.coin,
                            suggest.solution.source.account,
                            suggest.solution.destination.account,
                            EPlainSuggestionGroup.New,
                        ),
                        group: EPlainSuggestionGroup.New,

                        accounts: fullInfoByCoin?.graph?.accounts,
                        possibleTransfers: fullInfoByCoin?.graph?.possibleTransfers
                            ?.filter(({ isSuggestEnabled }) => isSuggestEnabled)
                            ?.sort((a, b) =>
                                `${a.from.account}-${b.from.account}`.localeCompare(
                                    `${a.to.account}-${b.to.account}`,
                                ),
                            ),

                        exchangeStats: fullInfoByCoin?.exchangeStats,
                    });
                }
            }
        });

        return acc;
    }, [] as TPlainSuggestion[]);
}
