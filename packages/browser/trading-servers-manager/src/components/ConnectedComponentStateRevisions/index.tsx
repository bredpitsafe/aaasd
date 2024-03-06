import { Button } from '@frontend/common/src/components/Button';
import { ConnectedRevisionSelector } from '@frontend/common/src/components/connectedComponents/ConnectedRevisionSelector';
import { DiffSwitcher } from '@frontend/common/src/components/Editors/components/ConfigActions';
import { ConfigFullEditor } from '@frontend/common/src/components/Editors/ConfigFullEditor';
import {
    EConfigEditorLanguages,
    EConfigEditorMode,
} from '@frontend/common/src/components/Editors/types';
import { compareConfigs } from '@frontend/common/src/components/Editors/utils';
import { Empty } from '@frontend/common/src/components/Empty';
import { useDraft } from '@frontend/common/src/components/hooks/components/useDraft';
import { useScrollPosition } from '@frontend/common/src/components/hooks/components/useScrollPosition';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import { Space } from '@frontend/common/src/components/Space';
import { useModule } from '@frontend/common/src/di/react';
import { useMutationHandler } from '@frontend/common/src/hooks/useMutationHandler';
import { EComponentStateEditorStateSource } from '@frontend/common/src/modules/componentStateEditor';
import { useEditorState } from '@frontend/common/src/modules/componentStateEditor/hooks';
import { ComponentTabKey } from '@frontend/common/src/types/componentMetadata';
import { EComponentType, TComponentId } from '@frontend/common/src/types/domain/component';
import { TComponentStateRevision } from '@frontend/common/src/types/domain/ComponentStateRevision';
import { FailFactory } from '@frontend/common/src/types/Fail';
import { ISO } from '@frontend/common/src/types/time';
import { ValueDescriptor } from '@frontend/common/src/types/ValueDescriptor';
import { assertNever } from '@frontend/common/src/utils/assert';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { mapDesc, switchMapDesc } from '@frontend/common/src/utils/Rx/desc';
import { generateTraceId, TraceId } from '@frontend/common/src/utils/traceId';
import {
    FailDesc,
    IdleDesc,
    isFailDesc,
    isSyncDesc,
    isUnscDesc,
    matchDesc,
    SyncDesc,
    UnscDesc,
} from '@frontend/common/src/utils/ValueDescriptor';
import { isEmpty, isNil, isNull, isString, isUndefined } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { of } from 'rxjs';

import { ModuleTradingServersManagerActions } from '../../modules/actions/module';
import { cnControls, cnEmptyRoot, cnRoot } from './styles.css';

type TProps = {
    componentId: TComponentId;
};
const ConnectedComponentStateRevisionsFail = FailFactory('ConnectedComponentStateRevisions');
const NOT_FOUND = ConnectedComponentStateRevisionsFail('NOT_FOUND');
type TStateDesc = ValueDescriptor<string, typeof NOT_FOUND, null>;
type TComponentStateRevisionDesc = ValueDescriptor<TComponentStateRevision, typeof NOT_FOUND, null>;

export function ConnectedComponentStateRevisions({ componentId }: TProps) {
    const traceId = useMemo(() => generateTraceId(), []);
    const [editorState, setEditorState] = useEditorState();

    const [viewMode, setViewMode] = useState<EConfigEditorMode>(EConfigEditorMode.single);

    const { getComponentStateRevisions, createComponentStateRevision } = useModule(
        ModuleTradingServersManagerActions,
    );
    const revisions = useValueDescriptorObservableDeprecated(
        getComponentStateRevisions({ componentId }, traceId),
    );
    const actualRev = useActualRev(componentId, traceId);
    const editorRev = useRevision(componentId, editorState?.revision, traceId);
    const actualState = useCompoentState(componentId, actualRev, traceId);
    const seamlessActualState = useSeamlessState(actualState);
    const editorRevState = useCompoentState(componentId, editorRev, traceId);
    const seamlessEditorRevState = useSeamlessState(editorRevState);
    const [createStatus, create] = useMutationHandler(createComponentStateRevision);

    const [setDraftWithoutCheck, , draft$] = useDraft(
        EComponentType.robot,
        componentId,
        ComponentTabKey.State,
    );
    const draft = useSyncObservable(draft$) ?? null;
    const setDraft = useFunction((value?: string | null) => {
        if (!isSyncDesc(actualState)) {
            return;
        }

        if (isNil(value) || compareConfigs(value, actualState.value)) {
            setDraftWithoutCheck(undefined);
        } else {
            setDraftWithoutCheck(value ?? undefined);
        }
    });

    useEffect(() => {
        if (!isSyncDesc(actualState) || !isSyncDesc(editorRevState) || !isNil(draft)) {
            return;
        }

        if (!compareConfigs(editorRevState.value, actualState.value)) {
            setDraft(editorRevState.value);
        }
    }, [draft, actualState, editorRevState, setDraft]);

    const focusToLine = useMemo(() => {
        if (editorState?.source === EComponentStateEditorStateSource.System) {
            return editorState?.selection?.startLine;
        }
    }, [editorState]);

    const highlightLines = useMemo(() => {
        if (
            editorState?.source === EComponentStateEditorStateSource.System &&
            editorState.selection
        ) {
            const { startLine, endLine } = editorState.selection;
            return {
                start: startLine,
                end: endLine,
            };
        }

        return undefined;
    }, [editorState]);

    useEffect(() => {
        if (!isUndefined(editorState) || !isSyncDesc(revisions) || isEmpty(revisions.value)) return;

        setEditorState({
            source: EComponentStateEditorStateSource.Editor,
            revision: revisions.value[0].platformTime,
        });
    }, [revisions, editorRev, editorState, setEditorState]);

    useEffect(() => {
        if (
            isUndefined(editorState) ||
            editorState.source !== EComponentStateEditorStateSource.Editor ||
            !isSyncDesc(revisions)
        )
            return;

        const lastRevision = revisions.value.at(0);
        if (isUndefined(lastRevision) || editorState.revision === lastRevision.platformTime) return;

        setEditorState({
            source: EComponentStateEditorStateSource.Editor,
            revision: lastRevision.platformTime,
            selection: editorState.selection,
        });
    }, [revisions, editorState, setEditorState]);

    useEffect(() => {
        if (isSyncDesc(createStatus) && isSyncDesc(actualRev)) {
            setDraft(null);
            setEditorState({
                source: EComponentStateEditorStateSource.Editor,
                revision: actualRev.value.platformTime,
            });
        }
    }, [createStatus, actualRev, setEditorState, setDraft]);

    const changeRevision = useFunction((r: TComponentStateRevision) => {
        setDraft(null);
        setEditorState({
            source: EComponentStateEditorStateSource.User,
            revision: r.platformTime,
        });
    });

    const saveSelection = useFunction((s) => {
        if (isUndefined(editorState)) return;
        setEditorState({
            source: EComponentStateEditorStateSource.User,
            revision: editorState.revision,
            selection: isNull(s) ? undefined : s,
        });
    });

    const discardChanges = useFunction(() => {
        setDraft(null);
        if (!isSyncDesc(actualRev)) return;
        setEditorState({
            source: EComponentStateEditorStateSource.Editor,
            revision: actualRev.value.platformTime,
        });
    });

    const createNewRevision = useFunction(() => {
        if (!isSyncDesc(actualRev) || isNull(actualState.value)) return;
        if (!isNull(draft) && draft !== actualState.value) {
            create({
                componentId,
                state: draft,
                parentDigest: actualRev.value.digest,
            });
            return;
        }
        if (!isSyncDesc(editorRev)) return;
        if (editorRev.value.digest === actualRev.value.digest) return;
        if (!isSyncDesc(editorRevState)) return;
        create({
            componentId,
            state: draft ?? editorRevState.value,
            parentDigest: actualRev.value.digest,
        });
    });

    const [setScrollPosition, getScrollPosition] = useScrollPosition(
        EComponentType.robot,
        componentId,
        ComponentTabKey.State,
    );

    if (isSyncDesc(revisions) && isEmpty(revisions.value)) {
        return (
            <div className={cnEmptyRoot}>
                <Empty description="The robot currently does not have a state" />
            </div>
        );
    }

    if (
        !isSyncDesc(revisions) ||
        isNull(seamlessActualState.value) ||
        isNull(seamlessEditorRevState.value)
    ) {
        return (
            <LoadingOverlay
                text={!isSyncDesc(revisions) ? 'Loading Revisions...' : 'Loading state...'}
            />
        );
    }

    const contentSaveUnavailable = isUnscDesc(createStatus) || !isString(draft);

    return (
        <div className={cnRoot}>
            {isFailDesc(editorRevState) ? (
                <div className={cnEmptyRoot}>
                    <Empty description="Revision not found" />
                </div>
            ) : (
                <ConfigFullEditor
                    language={EConfigEditorLanguages.json}
                    value={seamlessActualState.value}
                    modifiedValue={draft ?? seamlessEditorRevState.value}
                    onChangeSelection={saveSelection}
                    focusToLine={focusToLine}
                    selection={editorState?.selection}
                    viewMode={viewMode}
                    highlightLines={highlightLines}
                    onSetScrollPosition={setScrollPosition}
                    getScrollPosition={getScrollPosition}
                    onChangeValue={setDraft}
                />
            )}

            <Space className={cnControls}>
                {viewMode === EConfigEditorMode.diff ? (
                    <ConnectedRevisionSelector
                        options={revisions.value}
                        current={actualRev.value}
                        disabled
                    />
                ) : null}
                <Button
                    onClick={createNewRevision}
                    disabled={contentSaveUnavailable}
                    loading={isUnscDesc(createStatus)}
                >
                    Apply
                </Button>
                <Button onClick={discardChanges} disabled={contentSaveUnavailable}>
                    Discard
                </Button>
                <DiffSwitcher defaultValue={viewMode} onChange={setViewMode} />
                <ConnectedRevisionSelector
                    options={revisions.value}
                    current={editorRev.value}
                    onChange={changeRevision}
                />
            </Space>
        </div>
    );
}

function useRevision(
    componentId: TComponentId,
    platformTime: ISO | undefined,
    traceId: TraceId,
): TComponentStateRevisionDesc {
    const { getComponentStateRevisions, getComponentStateRevision } = useModule(
        ModuleTradingServersManagerActions,
    );

    const revision$ = useMemo(
        () =>
            getComponentStateRevisions({ componentId }, traceId).pipe(
                mapDesc({
                    idle: (): TComponentStateRevisionDesc => UnscDesc(null),
                    unsynchronized: (): TComponentStateRevisionDesc => UnscDesc(null),
                    synchronized: (revisions): TComponentStateRevisionDesc => {
                        const fromLastRevisions = revisions.find(
                            (r) => r.platformTime === platformTime,
                        );

                        if (fromLastRevisions) return SyncDesc(fromLastRevisions, null);

                        return FailDesc(NOT_FOUND);
                    },
                    fail: (): TComponentStateRevisionDesc => FailDesc(NOT_FOUND),
                }),
                switchMapDesc({
                    idle: () => of<TComponentStateRevisionDesc>(IdleDesc()),
                    unsynchronized: () => of<TComponentStateRevisionDesc>(UnscDesc(null)),
                    synchronized: (v) => of<TComponentStateRevisionDesc>(SyncDesc(v, null)),
                    fail: () => {
                        if (isUndefined(platformTime)) {
                            return of<TComponentStateRevisionDesc>(UnscDesc(null));
                        }
                        return getComponentStateRevision(
                            { componentId, platformTime },
                            traceId,
                        ).pipe<TComponentStateRevisionDesc>(
                            mapDesc({
                                idle: () => UnscDesc(null),
                                unsynchronized: () => UnscDesc(null),
                                synchronized: (v) => SyncDesc(v, null),
                                fail: () => FailDesc(NOT_FOUND),
                            }),
                        );
                    },
                }),
            ),
        [componentId, getComponentStateRevision, getComponentStateRevisions, platformTime, traceId],
    );

    return useValueDescriptorObservableDeprecated(revision$);
}

function useActualRev(componentId: TComponentId, traceId: TraceId): TComponentStateRevisionDesc {
    const { getComponentStateRevisions } = useModule(ModuleTradingServersManagerActions);
    const revisions = useValueDescriptorObservableDeprecated(
        getComponentStateRevisions({ componentId }, traceId),
    );

    return useMemo(
        () =>
            matchDesc(revisions, {
                idle: () => UnscDesc(null),
                unsynchronized: () => UnscDesc(null),
                synchronized: (revisions) => {
                    const lastRevision = revisions.at(0);
                    if (isUndefined(lastRevision)) return FailDesc(NOT_FOUND);

                    return SyncDesc(lastRevision, null);
                },
                fail: () => UnscDesc(null),
            }),
        [revisions],
    );
}

function useSeamlessState(state: TStateDesc) {
    const currentSeamlessActualState = useRef<TStateDesc>(UnscDesc(null));
    const seamlessActualState = useMemo(
        (): TStateDesc =>
            matchDesc(state, {
                idle: () => currentSeamlessActualState.current,
                unsynchronized: () => UnscDesc(null, currentSeamlessActualState.current.value),
                synchronized: (v) => SyncDesc(v, null),
                fail: (f) => FailDesc(f, currentSeamlessActualState.current.value),
            }),
        [state],
    );
    currentSeamlessActualState.current = seamlessActualState;
    return seamlessActualState;
}

function useCompoentState(
    componentId: TComponentId,
    revision: TComponentStateRevisionDesc,
    traceId: TraceId,
): TStateDesc {
    const { getComponentState } = useModule(ModuleTradingServersManagerActions);

    const getComponentState$ = useFunction((digest: string) =>
        getComponentState({ componentId, digest }, traceId).pipe<TStateDesc>(
            mapDesc({
                idle: () => UnscDesc(null),
                unsynchronized: () => UnscDesc(null),
                synchronized: (state) => SyncDesc(state, null),
                fail: ({ code }) => {
                    switch (code) {
                        case '[State]: NOT_FOUND':
                            return FailDesc(NOT_FOUND);
                        default:
                            assertNever(code);
                    }
                },
            }),
        ),
    );

    const editorRevState$ = useMemo(
        () =>
            matchDesc(revision, {
                idle: () => of<TStateDesc>(UnscDesc(null)),
                unsynchronized: () => of<TStateDesc>(UnscDesc(null)),
                synchronized: ({ digest }) => getComponentState$(digest),
                fail: (fail) => of<TStateDesc>(FailDesc(fail)),
            }),
        [revision, getComponentState$],
    );

    return useValueDescriptorObservableDeprecated(editorRevState$);
}
