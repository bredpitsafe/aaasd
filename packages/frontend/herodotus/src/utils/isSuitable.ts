import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import { EAmountNotationType } from '@frontend/common/src/types/domain/instrument';

export function instrumentIsSuitableForAsset(inst: TInstrument, asset: TAsset) {
    return inst.amountNotation.type === EAmountNotationType.Asset
        ? inst.amountNotation.assetId === asset.id
        : 'baseCurrency' in inst.kind && inst.kind.baseCurrency === asset.id;
}
