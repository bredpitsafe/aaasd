import { Observable } from 'rxjs';

import { frameTasks } from '../TasksScheduler/frameTasks';

export function frameInterval(
    frames: number,
    props?: {
        ctx?: unknown;
        args?: unknown[];
    },
): Observable<void> {
    return new Observable((subscriber) => {
        return frameTasks.addInterval(() => subscriber.next(), frames, props);
    });
}
