import { firstValueFrom, interval, map } from 'rxjs';

export const wait = (ms = 100): Promise<void> =>
    firstValueFrom<void>(interval(ms).pipe(map(() => undefined)));
