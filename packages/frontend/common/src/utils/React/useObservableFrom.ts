import { useMemo } from 'react';
import { useUnmount } from 'react-use';
import type { Observable } from 'rxjs';
import { ReplaySubject } from 'rxjs';

export function useObservableFrom<T>(props: T): Observable<T> {
    const obs = useMemo(() => new ReplaySubject(1), []);

    obs.next(props);

    useUnmount(() => obs.complete());

    return obs as Observable<T>;
}
