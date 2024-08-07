import type { Observable } from 'rxjs';
import { distinctUntilChanged, map, shareReplay } from 'rxjs/operators';

import { ModuleFactory } from '../../di';
import type { TSocketName, TSocketURL } from '../../types/domain/sockets';
import type { TSocketStruct } from '../../types/domain/sockets';
import { createObservableBox } from '../../utils/rx';

const boxCurrentSocket = createObservableBox<undefined | TSocketStruct>(undefined);

const currentSocketName$ = boxCurrentSocket.obs.pipe(
    map((struct) => struct?.name),
    distinctUntilChanged(),
    shareReplay(1),
);

const currentSocketUrl$ = boxCurrentSocket.obs.pipe(
    map((struct) => struct?.url),
    distinctUntilChanged(),
    shareReplay(1),
);

const currentSocketStruct$ = boxCurrentSocket.obs.pipe(
    distinctUntilChanged((a, b) => a?.name === b?.name && a?.url === b?.url),
    shareReplay(1),
);

export function getCurrentSocket$(): Observable<TSocketName | undefined> {
    return currentSocketName$;
}

export function createModule() {
    function resetCurrentSocket(): void {
        boxCurrentSocket.set(undefined);
    }

    function setCurrentSocket(name: TSocketName, url: TSocketURL): void {
        boxCurrentSocket.set({ name, url });
    }

    function getCurrentSocket(): undefined | TSocketStruct {
        return boxCurrentSocket.get();
    }

    return {
        currentSocketStruct$,
        currentSocketUrl$,
        currentSocketName$,
        setCurrentSocket,
        getCurrentSocket,
        resetCurrentSocket,
    };
}

export const ModuleSocketPage = ModuleFactory(createModule);
