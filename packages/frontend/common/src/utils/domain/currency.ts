// name can be coin/asset name or currency name
import { ValueOf } from '../../types';
import { ECoin, ECoinSymbol, ECurrency, ECurrencySymbol } from '../../types/domain/currency';

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
