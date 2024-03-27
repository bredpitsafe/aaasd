import type { TCoinBalanceReconciliationSuggest } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import {
    ESuggestProblemKind,
    TCoinConvertRate,
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isInProgressBalanceReconciliationStep } from '@frontend/common/src/types/domain/balanceMonitor/guards';
import type { TFail } from '@frontend/common/src/types/Fail';
import {
    ExtractValueDescriptor,
    isFailDesc,
    isIdleDesc,
    isUnscDesc,
    ValueDescriptorFactory,
} from '@frontend/common/src/utils/ValueDescriptor';
import { sortBy } from 'lodash-es';
import { useMemo } from 'react';

import type { TCoinInfoDescriptor } from '../../../../modules/observables/ModuleCoinInfo';
import type { TConvertRatesDescriptor } from '../../../../modules/observables/ModuleConvertRates';
import type { TSuggestionsDescriptor } from '../../../../modules/observables/ModuleSuggestions';
import { roundAmount } from '../../../utils';
import type { TPlainSuggestion } from '../defs';
import { EAmountNotification, EPlainSuggestionGroup, SUGGEST_AMOUNT_DIGITS } from '../defs';
import { getSuggestHash, getSuggestKey } from '../utils';

const plainSuggestionsDescriptorFactory = ValueDescriptorFactory<
    TPlainSuggestion[],
    | TFail<'[TransferSuggestions]: UNKNOWN'>
    | TFail<'[CoinInfo]: UNKNOWN'>
    | TFail<'[ConvertRates]: UNKNOWN'>
>();

export function usePlainSuggestions(
    suggestionsDescriptor: TSuggestionsDescriptor,
    coinInfoDescriptor: TCoinInfoDescriptor,
    convertRatesDescriptor: TConvertRatesDescriptor,
): ExtractValueDescriptor<typeof plainSuggestionsDescriptorFactory> {
    return useMemo(() => {
        if (isFailDesc(suggestionsDescriptor)) {
            return plainSuggestionsDescriptorFactory.fail(suggestionsDescriptor.fail);
        }
        if (isFailDesc(coinInfoDescriptor)) {
            return plainSuggestionsDescriptorFactory.fail(coinInfoDescriptor.fail);
        }
        if (isFailDesc(convertRatesDescriptor)) {
            return plainSuggestionsDescriptorFactory.fail(convertRatesDescriptor.fail);
        }

        if (
            isIdleDesc(suggestionsDescriptor) ||
            isIdleDesc(coinInfoDescriptor) ||
            isIdleDesc(convertRatesDescriptor)
        ) {
            return plainSuggestionsDescriptorFactory.idle();
        }

        if (
            isUnscDesc(suggestionsDescriptor) ||
            isUnscDesc(coinInfoDescriptor) ||
            isUnscDesc(convertRatesDescriptor)
        ) {
            return plainSuggestionsDescriptorFactory.unsc(null);
        }

        return plainSuggestionsDescriptorFactory.sync(
            mapSuggestionsToPlainSuggestions(
                suggestionsDescriptor.value,
                coinInfoDescriptor.value,
                convertRatesDescriptor.value,
            ),
            null,
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
