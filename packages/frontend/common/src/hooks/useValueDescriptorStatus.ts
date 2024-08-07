import { isNil } from 'lodash-es';

import type { TComponentValueDescriptor } from '../utils/React/useValueDescriptorObservable.ts';
import { isUnsyncedValueDescriptor } from '../utils/ValueDescriptor/utils.ts';

type TUseValueDescriptorsStatusProps = {
    descriptors: TComponentValueDescriptor<unknown>[];
};

type TUseValueDescriptorsReturnType = {
    isBroken: boolean;
    hasFail: boolean;
    hasPending: boolean;
};

export const useValueDescriptorsStatus = (
    props: TUseValueDescriptorsStatusProps,
): TUseValueDescriptorsReturnType => {
    const isBroken = props.descriptors.some((desc) => desc.isBroken);
    const hasFail = props.descriptors.some(
        (desc) => isUnsyncedValueDescriptor(desc) && !isNil(desc.fail),
    );
    const hasPending = props.descriptors.some(
        (desc) => isUnsyncedValueDescriptor(desc) && !isNil(desc.meta?.pendingState),
    );

    return { isBroken, hasFail, hasPending };
};
