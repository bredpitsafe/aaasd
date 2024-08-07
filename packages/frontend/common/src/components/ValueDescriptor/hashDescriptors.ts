import { isNil } from 'lodash-es';

import type { TComponentValueDescriptor } from '../../utils/React/useValueDescriptorObservable.ts';

function hashDescriptor<T>(descriptor: TComponentValueDescriptor<T>): string {
    return `${descriptor.state}-${isNil(descriptor.fail)}-${descriptor.isBroken}-
        ${descriptor.meta?.pendingState}`;
}
export function hashDescriptors<T>(descriptors: TComponentValueDescriptor<T>[]): string {
    return descriptors.map(hashDescriptor).join('|');
}
