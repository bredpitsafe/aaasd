import { map } from 'rxjs/operators';

import { EDomainName } from '../../types/domain/evironment.ts';
import type { TValueDescriptor2 } from '../../utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    isFailValueDescriptor,
    isSyncedValueDescriptor,
} from '../../utils/ValueDescriptor/utils.ts';

export function squashRecord<T>() {
    return map(
        ({
            ms,
            prod,
        }: Record<EDomainName, TValueDescriptor2<T>>): TValueDescriptor2<
            Record<EDomainName, null | T>
        > => {
            if (isSyncedValueDescriptor(ms) || isSyncedValueDescriptor(prod)) {
                return createSyncedValueDescriptor({
                    [EDomainName.Ms]: ms.value,
                    [EDomainName.Prod]: prod.value,
                });
            } else {
                return isFailValueDescriptor(prod) ? prod : ms;
            }
        },
    );
}
