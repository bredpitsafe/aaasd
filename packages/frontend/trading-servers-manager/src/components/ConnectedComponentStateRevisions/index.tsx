import type { ISO } from '@common/types';
import type { TraceId } from '@common/utils';
import { generateTraceId } from '@common/utils';
import {
    EStateTabSelectors,
    StateTabProps,
} from '@frontend/common/e2e/selectors/trading-servers-manager/components/state-tab/state.tab.selectors';
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
import { ModuleFetchComponentStateRevisionOnCurrentStage } from '@frontend/common/src/modules/actions/components/FetchComponentStateRevisionOnCurrentStage.ts';
import { ModuleCreateCurrentComponentStateRevision } from '@frontend/common/src/modules/actions/components/ModuleCreateCurrentComponentStateRevision.ts';
import { ModuleGetComponentStateOnCurrentStage } from '@frontend/common/src/modules/actions/components/ModuleGetComponentStateOnCurrentStage.ts';
import { ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage } from '@frontend/common/src/modules/actions/components/ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage.ts';
import { EComponentStateEditorStateSource } from '@frontend/common/src/modules/componentStateEditor';
import { useEditorState } from '@frontend/common/src/modules/componentStateEditor/hooks';
import { ComponentTabKey } from '@frontend/common/src/types/componentMetadata';
import type { TComponentId } from '@frontend/common/src/types/domain/component';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TComponentStateRevision } from '@frontend/common/src/types/domain/ComponentStateRevision';
import { Fail } from '@frontend/common/src/types/Fail';
import { EGrpcErrorCode } from '@frontend/common/src/types/GrpcError.ts';
import { identity } from '@frontend/common/src/utils/identity.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction.ts';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import {
    mapValueDescriptor,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    EMPTY_VD,
    isFailValueDescriptor,
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
    isUnsyncedValueDescriptor,
    matchValueDescriptor,
    WAITING_VD,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isEmpty, isNil, isNull, isString, isUndefined } from 'lodash-es';
import { useEffect, useMemo, useRef, useState } from 'react';
import { of } from 'rxjs';

import { cnControls, cnEmptyRoot, cnRoot } from './styles.css';

type TProps = {
    componentId: TComponentId;
};

const FAIL_NOT_FOUND = Fail(EGrpcErrorCode.NOT_FOUND, { message: `Not found` });

type TStateDesc = TValueDescriptor2<string, null | string>;
type TComponentStateRevisionDesc = TValueDescriptor2<TComponentStateRevision>;

export function ConnectedComponentStateRevisions({ componentId }: TProps) {
    const traceId = useMemo(() => generateTraceId(), []);
    const [editorState, setEditorState] = useEditorState();

    const [viewMode, setViewMode] = useState<EConfigEditorMode>(EConfigEditorMode.single);

    const subscribeToComponentStateRevisionsSnapshot = useModule(
        ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage,
    );

    const revisions = useNotifiedValueDescriptorObservable(
        subscribeToComponentStateRevisionsSnapshot({ componentId }, { traceId }),
    );
    const actualRev = useActualRev(componentId, traceId);
    const editorRev = useRevision(componentId, editorState?.revision, traceId);
    const actualState = useComponentState(componentId, actualRev, traceId);
    const seamlessActualState = useSeamlessState(actualState);
    const editorRevState = useComponentState(componentId, editorRev, traceId);
    const seamlessEditorRevState = useSeamlessState(editorRevState);
    const createComponentStateRevision = useModule(ModuleCreateCurrentComponentStateRevision);

    const [create, createStatus] = useNotifiedObservableFunction(createComponentStateRevision);

    const [setDraftWithoutCheck, , draft$] = useDraft(
        EComponentType.robot,
        componentId,
        ComponentTabKey.State,
    );
    const draft = useSyncObservable(draft$) ?? null;
    const setDraft = useFunction((value?: string | null) => {
        if (!isSyncedValueDescriptor(actualState)) {
            return;
        }

        if (isNil(value) || compareConfigs(value, actualState.value)) {
            setDraftWithoutCheck(undefined);
        } else {
            setDraftWithoutCheck(value ?? undefined);
        }
    });

    useEffect(() => {
        if (
            !isSyncedValueDescriptor(actualState) ||
            !isSyncedValueDescriptor(editorRevState) ||
            !isNil(draft)
        ) {
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
        if (
            !isUndefined(editorState) ||
            !isSyncedValueDescriptor(revisions) ||
            isEmpty(revisions.value)
        )
            return;

        setEditorState({
            source: EComponentStateEditorStateSource.Editor,
            revision: revisions.value[0].platformTime,
        });
    }, [revisions, editorRev, editorState, setEditorState]);

    useEffect(() => {
        if (
            isUndefined(editorState) ||
            editorState.source !== EComponentStateEditorStateSource.Editor ||
            !isSyncedValueDescriptor(revisions)
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
        if (isSyncedValueDescriptor(createStatus) && isSyncedValueDescriptor(actualRev)) {
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
        if (!isSyncedValueDescriptor(actualRev)) return;
        setEditorState({
            source: EComponentStateEditorStateSource.Editor,
            revision: actualRev.value.platformTime,
        });
    });

    const createNewRevision = useFunction(() => {
        if (!isSyncedValueDescriptor(actualRev) || isNull(actualState.value)) return;
        if (!isNull(draft) && draft !== actualState.value) {
            return create(
                {
                    componentId,
                    newStateRaw: draft,
                    currentDigest: actualRev.value.digest,
                },
                { traceId: generateTraceId() },
            );
        }
        if (!isSyncedValueDescriptor(actualRev)) return;
        if (!isSyncedValueDescriptor(editorRev)) return;
        if (!isSyncedValueDescriptor(editorRevState)) return;
        if (editorRev.value.digest === actualRev.value.digest) return;
        return create(
            {
                componentId,
                newStateRaw: draft ?? editorRevState.value,
                currentDigest: actualRev.value.digest,
            },
            { traceId: generateTraceId() },
        );
    });

    const [setScrollPosition, getScrollPosition] = useScrollPosition(
        EComponentType.robot,
        componentId,
        ComponentTabKey.State,
    );

    if (isSyncedValueDescriptor(revisions) && isEmpty(revisions.value)) {
        return (
            <div className={cnEmptyRoot}>
                <Empty description="The robot currently does not have a state" />
            </div>
        );
    }

    if (
        !isSyncedValueDescriptor(revisions) ||
        isNull(seamlessActualState.value) ||
        isNull(seamlessEditorRevState.value)
    ) {
        return (
            <LoadingOverlay
                text={
                    isLoadingValueDescriptor(revisions)
                        ? 'Loading Revisions...'
                        : 'Loading state...'
                }
            />
        );
    }

    const contentSaveUnavailable = isUnsyncedValueDescriptor(createStatus) || !isString(draft);

    return (
        <div {...StateTabProps[EStateTabSelectors.StateForm]} className={cnRoot}>
            {isFailValueDescriptor(editorRevState) ? (
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
                    {...StateTabProps[EStateTabSelectors.ApplyButton]}
                    onClick={createNewRevision}
                    disabled={contentSaveUnavailable}
                    loading={!isNil(createStatus) && isLoadingValueDescriptor(createStatus)}
                >
                    Apply
                </Button>
                <Button
                    {...StateTabProps[EStateTabSelectors.DiscardButton]}
                    onClick={discardChanges}
                    disabled={contentSaveUnavailable}
                >
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
    const fetch = useModule(ModuleFetchComponentStateRevisionOnCurrentStage);
    const subscribe = useModule(ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage);

    const revision$ = useMemo(
        () =>
            isUndefined(platformTime)
                ? of(WAITING_VD)
                : subscribe({ componentId }, { traceId }).pipe(
                      switchMapValueDescriptor(({ value: revisions }) => {
                          const fromLastRevisions = revisions.find(
                              (r) => r.platformTime === platformTime,
                          );

                          return !isUndefined(fromLastRevisions)
                              ? of(createSyncedValueDescriptor(fromLastRevisions))
                              : fetch({ componentId, platformTime }, { traceId }).pipe(
                                    mapValueDescriptor(({ value }) => {
                                        return isNil(value)
                                            ? createUnsyncedValueDescriptor(FAIL_NOT_FOUND)
                                            : createSyncedValueDescriptor(value);
                                    }),
                                );
                      }),
                  ),
        [componentId, fetch, platformTime, subscribe, traceId],
    );

    return useNotifiedValueDescriptorObservable(revision$);
}

function useActualRev(componentId: TComponentId, traceId: TraceId): TComponentStateRevisionDesc {
    const subscribe = useModule(ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage);
    const revisions = useNotifiedValueDescriptorObservable(subscribe({ componentId }, { traceId }));

    return useMemo(
        () =>
            matchValueDescriptor(revisions, ({ value: revisions }) => {
                const lastRevision = revisions.at(0);

                return isUndefined(lastRevision)
                    ? createUnsyncedValueDescriptor(FAIL_NOT_FOUND)
                    : createSyncedValueDescriptor(lastRevision);
            }),
        [revisions],
    );
}

function useSeamlessState(state: TStateDesc) {
    const currentSeamlessActualState = useRef<TStateDesc>(EMPTY_VD);
    const seamlessActualState = useMemo(
        (): TStateDesc =>
            matchValueDescriptor(state, {
                unsynced: (vd) =>
                    createUnsyncedValueDescriptor(
                        currentSeamlessActualState.current.value,
                        vd.fail,
                        vd.meta,
                    ),
                synced: identity,
            }),
        [state],
    );
    currentSeamlessActualState.current = seamlessActualState;
    return seamlessActualState;
}

function useComponentState(
    componentId: TComponentId,
    revision: TComponentStateRevisionDesc,
    traceId: TraceId,
): TStateDesc {
    const getComponentState = useModule(ModuleGetComponentStateOnCurrentStage);

    const editorRevState$ = useMemo(
        () =>
            matchValueDescriptor(revision, {
                synced: ({ value }) =>
                    getComponentState({ componentId, digest: value.digest }, { traceId }),
                unsynced: (vd) => of(vd),
            }),
        [revision, getComponentState, componentId, traceId],
    );

    return useNotifiedValueDescriptorObservable(editorRevState$);
}
