import type { MonoTypeOperatorFunction } from 'rxjs';

import { convertGrpcFailToGrpcError } from '../ValueDescriptor/Fails';
import type { TValueDescriptor2 } from '../ValueDescriptor/types';
import { isFailValueDescriptor } from '../ValueDescriptor/utils';
import { tapValueDescriptor } from './ValueDescriptor2';

export function failToError<T extends TValueDescriptor2<any, any>>(): MonoTypeOperatorFunction<T> {
    return tapValueDescriptor<T>({
        unsynced: (vd) => {
            if (isFailValueDescriptor(vd)) {
                throw convertGrpcFailToGrpcError(vd.fail);
            }
        },
    });
}
