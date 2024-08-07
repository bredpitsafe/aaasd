import { isEqual } from 'lodash-es';
import type { Observable } from 'rxjs';
import { distinctUntilChanged, ReplaySubject, shareReplay } from 'rxjs';

import { ModuleFactory } from '../../di';
import type { TEditorState } from './domain';
export type { TEditorState } from './domain';
export { EComponentStateEditorStateSource } from './domain';

function createModule() {
    const in$ = new ReplaySubject<TEditorState | undefined>(1);
    const out$ = in$.pipe(
        distinctUntilChanged((p, n) => isEqual(p, n)),
        shareReplay(1),
    );

    return {
        setComponentStateEditorState(s: TEditorState | undefined) {
            in$.next(s);
        },
        getComponentStateEditorState(): Observable<TEditorState | undefined> {
            return out$;
        },
    };
}

export const ModuleComponentStateEditor = ModuleFactory(createModule);
