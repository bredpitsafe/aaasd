import { TSocketURL } from '../../types/domain/sockets';
import { Milliseconds } from '../../types/time';

export type TSocketServerTimeMap = Record<TSocketURL, Milliseconds>;
