import { once } from 'lodash-es';
import { tap } from 'rxjs/operators';

import type { TReceivedData } from '../../../lib/BFFSocket/def';
import type { TSocketURL } from '../../../types/domain/sockets';
import { logger } from '../../../utils/Tracing';
import type {
    TSyncedValueDescriptor,
    TValueDescriptor2,
} from '../../../utils/ValueDescriptor/types';
import { isSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';
import { prepareEnvelopeToTracing } from '../utils';

export function traceFirstReceiveEnvelopeOperator<T extends TValueDescriptor2<TReceivedData<any>>>(
    url: TSocketURL,
    type: string,
) {
    const logOnce = once((vd: TSyncedValueDescriptor<TReceivedData<any>>) =>
        logger.trace('[FetchHandlers]: Receive first envelope', {
            url,
            envelope: prepareEnvelopeToTracing(vd.value),
            requestType: type,
            responseType: 'type' in vd.value?.payload ? vd.value?.payload.type : undefined,
        }),
    );

    return tap<T>((vd) => {
        if (isSyncedValueDescriptor(vd)) {
            logOnce(vd);
        }
    });
}
