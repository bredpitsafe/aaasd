import { assertNever } from '@common/utils/src/assert.ts';
import type { OperatorFunction } from 'rxjs';
import { pipe } from 'rxjs';
import { map } from 'rxjs/operators';

import type {
    ExtractSyncedValueDescriptorPayload,
    ExtractUnsyncedValueDescriptorPayload,
    TSyncedValueDescriptor,
    TUnsyncedValueDescriptor,
    TValueDescriptor2,
} from '../ValueDescriptor/types';
import {
    createSyncedValueDescriptor,
    isSyncedValueDescriptor,
    isUnsyncedValueDescriptor,
} from '../ValueDescriptor/utils';
import { conditionalBufferTime, EBufferEmitType } from './conditionalBufferTime';

export function bufferTimeValueDescriptor<T extends TValueDescriptor2<any, any>>(
    bufferTimeSpan: number,
): OperatorFunction<
    T,
    | TUnsyncedValueDescriptor<ExtractUnsyncedValueDescriptorPayload<T>>
    | TSyncedValueDescriptor<ExtractSyncedValueDescriptorPayload<T>[]>
> {
    return pipe(
        conditionalBufferTime<T>({
            bufferTimeSpan,
            condition(desc) {
                return isSyncedValueDescriptor(desc)
                    ? EBufferEmitType.Buffer
                    : EBufferEmitType.PassThrough;
            },
        }) as OperatorFunction<
            T,
            | TUnsyncedValueDescriptor<ExtractUnsyncedValueDescriptorPayload<T>>
            | TSyncedValueDescriptor<ExtractSyncedValueDescriptorPayload<T>>[]
        >,
        map((descs) => {
            if (Array.isArray(descs)) {
                return createSyncedValueDescriptor(
                    descs.map(
                        ({
                            value,
                        }: TSyncedValueDescriptor<ExtractSyncedValueDescriptorPayload<T>>) => value,
                    ),
                );
            }

            if (isUnsyncedValueDescriptor(descs)) {
                return descs;
            }

            assertNever(descs);
        }),
    );
}
