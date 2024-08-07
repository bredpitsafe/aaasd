import { EMPTY, mergeMap, timer } from 'rxjs';

const RETRY_DELAY = 3_000;
export const GROUP_TTL = 60_000;

export const DELAYED_EMPTY = timer(RETRY_DELAY).pipe(mergeMap(() => EMPTY));
