// name can be coin/asset name or currency name
import type { ValueOf } from '@common/types';

import type { ECoin, ECurrency } from '../../types/domain/currency';
import { ECoinSymbol, ECurrencySymbol } from '../../types/domain/currency';

export function tryTransformToSymbol<
    N extends string | ValueOf<typeof ECurrency> | ValueOf<typeof ECoin>,
>(name: N): string {
    name = name.toUpperCase() as N;
    return (
        ECurrencySymbol[name as ValueOf<typeof ECurrency>] ??
        ECoinSymbol[name as ValueOf<typeof ECoin>] ??
        name
    );
}
