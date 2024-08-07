import type { Nil } from '@common/types';
import hash_sum from 'hash-sum';
import { isNil } from 'lodash-es';

import type { TSocketStruct, TSocketURL } from '../../types/domain/sockets.ts';
import { isSocketStruct } from '../url.ts';

export function getSocketUrlHash(target: TSocketStruct | TSocketURL | Nil): string {
    if (isNil(target)) {
        return hash_sum(undefined);
    }

    return hash_sum(isSocketStruct(target) ? target.url : target);
}
