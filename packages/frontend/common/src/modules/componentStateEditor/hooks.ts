import { useMemo } from 'react';

import type { TContextRef } from '../../di';
import { toContextRef } from '../../di';
import { useContextRef } from '../../di/react';
import { useFunction } from '../../utils/React/useFunction';
import { useSyncObservable } from '../../utils/React/useSyncObservable';
import type { TEditorState } from './domain';
import { ModuleComponentStateEditor } from './index';

export function useEditorState(): [TEditorState | undefined, (s: TEditorState) => void] {
    const ctx = useContextRef();
    return useLocalEditorStateCtx(ctx);
}

export function useLocalEditorState(): [TEditorState | undefined, (s: TEditorState) => void] {
    const localCtx = useMemo(() => toContextRef({}), []);
    return useLocalEditorStateCtx(localCtx);
}

function useLocalEditorStateCtx(
    ctx: TContextRef,
): [TEditorState | undefined, (s: TEditorState) => void] {
    const { getComponentStateEditorState, setComponentStateEditorState } =
        ModuleComponentStateEditor(ctx);
    return [
        useSyncObservable(getComponentStateEditorState()),
        useFunction((s: TEditorState) => {
            setComponentStateEditorState(s);
        }),
    ];
}
