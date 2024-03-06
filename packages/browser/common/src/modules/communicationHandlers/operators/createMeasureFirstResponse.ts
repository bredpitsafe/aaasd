import { once } from 'lodash-es';
import { tap } from 'rxjs/operators';

import { TReceivedData } from '../../../lib/BFFSocket/def';
import type { TSocketURL } from '../../../types/domain/sockets';
import type { Milliseconds } from '../../../types/time';
import { sum } from '../../../utils/math';
import { iso2milliseconds } from '../../../utils/time';
import {
    ExtractSyncedValueDescriptor,
    TValueDescriptor2,
} from '../../../utils/ValueDescriptor/types';
import { isSyncedValueDescriptor } from '../../../utils/ValueDescriptor/utils';

export function createMeasureFirstResponse(
    url: TSocketURL,
    collect: (v: { labels: [TSocketURL]; observe: Milliseconds }) => void,
) {
    let sendTime = <Milliseconds>0;

    const initFirstResponse = (timestamp: Milliseconds) => {
        sendTime = timestamp;
    };

    const measureFirstResponseOperator = <
        T extends TValueDescriptor2<TReceivedData<unknown>>,
    >() => {
        const collectOnce = once((vd: ExtractSyncedValueDescriptor<T>) =>
            collect({
                labels: [url],
                observe: sum(iso2milliseconds(vd.value.timestamp), -sendTime),
            }),
        );

        return tap<T>((envelope) => {
            if (isSyncedValueDescriptor(envelope)) {
                collectOnce(envelope);
            }
        });
    };

    return { initFirstResponse, measureFirstResponseOperator };
}
