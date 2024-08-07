import { number2DisplayNumber } from '@frontend/common/src/components/OrderBook/utils';
import type {
    TFunding,
    TFundingAmount,
} from '@frontend/common/src/modules/actions/components/ModuleGetComponentFundingOnCurrentStage.ts';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import { entityAssetIdToAssetId } from '@frontend/common/src/utils/entityIds';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TComponentValueDescriptor } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { mapValueDescriptor } from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    EMPTY_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import type { Observable } from 'rxjs';
import { BehaviorSubject, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

export function useDisplayBalances(
    virtualAccountId: string | undefined,
    instrumentId: TInstrumentId | undefined,
    assets: TAsset[],
    getFunding: (
        instrumentId: TInstrumentId,
        virtualAccountId: string | TVirtualAccountId,
    ) => Observable<TValueDescriptor2<TFunding>>,
): {
    fundingsDesc: TComponentValueDescriptor<{
        displayBalance: string | undefined;
        displayReferenceBalance: string | undefined;
        displayPosition: string | undefined;
    }>;
    refreshFundings: VoidFunction;
} {
    const reloadSubject = useMemo(() => new BehaviorSubject<void>(undefined), []);

    const fundingsDesc = useNotifiedValueDescriptorObservable(
        useMemo(
            () =>
                reloadSubject.pipe(
                    switchMap(() =>
                        isNil(instrumentId) || isNil(virtualAccountId)
                            ? of(EMPTY_VD)
                            : getFunding(instrumentId, virtualAccountId),
                    ),
                    mapValueDescriptor((fundingsDesc) =>
                        createSyncedValueDescriptor({
                            displayBalance: formatAmount(
                                fundingsDesc.value?.balance?.balance,
                                assets,
                            ),
                            displayReferenceBalance: formatAmount(
                                fundingsDesc.value.balance?.referenceBalance,
                                assets,
                            ),
                            displayPosition: formatAmount(fundingsDesc.value.position, assets),
                        }),
                    ),
                ),
            [reloadSubject, getFunding, instrumentId, virtualAccountId],
        ),
    );

    const refreshFundings = useFunction(() => reloadSubject.next());

    return { fundingsDesc, refreshFundings };
}

function formatAmount(
    fundingAmount: TFundingAmount | undefined,
    assets: TAsset[],
): string | undefined {
    if (isNil(fundingAmount)) {
        return undefined;
    }

    const value = number2DisplayNumber(fundingAmount.amount, '%.10g');

    const assetId = isNil(fundingAmount.assetId)
        ? undefined
        : entityAssetIdToAssetId(fundingAmount.assetId);

    const asset = isNil(assetId) ? undefined : assets.find(({ id }) => id === assetId);

    return isNil(asset) ? value : `${value} ${asset.name}`;
}
