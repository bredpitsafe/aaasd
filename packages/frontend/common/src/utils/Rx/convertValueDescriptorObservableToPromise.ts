import { EMPTY, firstValueFrom, Observable, of } from 'rxjs';

import type { TFail } from '../../types/Fail';
import { GrpcError } from '../../types/GrpcError';
import type { TStructurallyCloneable } from '../../types/serialization';
import type { ValueDescriptor } from '../../types/ValueDescriptor';
import { throwingError } from '../throwingError';
import { ExtractSyncedValueDescriptorPayload, TValueDescriptor2 } from '../ValueDescriptor/types';
import { isFailValueDescriptor } from '../ValueDescriptor/utils';
import { switchMapDesc } from './desc';
import { switchMapValueDescriptor } from './ValueDescriptor2';

/**
 * @deprecated
 */
export function convertValueDescriptorObservableToPromise<
    V,
    F extends TFail<string, undefined | TStructurallyCloneable>,
    P,
>(valueDescriptor$: Observable<ValueDescriptor<V, F, P>>): Promise<V> {
    return firstValueFrom(
        valueDescriptor$.pipe(
            switchMapDesc({
                idle: () => EMPTY,
                unsynchronized: () => EMPTY,
                synchronized: (value) => of(value),
                fail: ({ code }) => {
                    throw new Error(code);
                },
            }),
        ),
    );
}

export function convertValueDescriptorObservableToPromise2<VD extends TValueDescriptor2<any, any>>(
    descriptor$: Observable<VD>,
): Promise<ExtractSyncedValueDescriptorPayload<VD>> {
    return firstValueFrom(
        descriptor$.pipe(
            switchMapValueDescriptor({
                synced: (desc) => of(desc.value),
                unsynced: (vd) =>
                    isFailValueDescriptor(vd)
                        ? throwingError(
                              new GrpcError(vd.fail.meta.message, {
                                  code: vd.fail.code,
                                  description: vd.fail.meta.description,
                                  traceId: vd.fail.meta.traceId,
                              }),
                          )
                        : EMPTY,
            }),
        ),
    );
}
