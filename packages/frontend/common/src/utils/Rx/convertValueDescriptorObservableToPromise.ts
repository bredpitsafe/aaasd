import type { Observable } from 'rxjs';
import { EMPTY, firstValueFrom, of } from 'rxjs';

import { GrpcError } from '../../types/GrpcError';
import { throwingError } from '../throwingError';
import type {
    ExtractSyncedValueDescriptorPayload,
    TValueDescriptor2,
} from '../ValueDescriptor/types';
import { isFailValueDescriptor } from '../ValueDescriptor/utils';
import { switchMapValueDescriptor } from './ValueDescriptor2';

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
