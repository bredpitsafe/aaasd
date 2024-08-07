import type { Milliseconds } from '@common/types';

import type { TSocketURL } from '../../types/domain/sockets';

export type TSocketServerTimeMap = Record<TSocketURL, Milliseconds>;
