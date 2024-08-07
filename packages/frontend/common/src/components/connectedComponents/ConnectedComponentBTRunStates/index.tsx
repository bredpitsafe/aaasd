import cn from 'classnames';
import { isEmpty, isNil, isUndefined } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { of } from 'rxjs';

import { useModule } from '../../../di/react';
import { useTraceId } from '../../../hooks/useTraceId.ts';
import { ModuleGetComponentStateOnCurrentStage } from '../../../modules/actions/components/ModuleGetComponentStateOnCurrentStage.ts';
import { ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage } from '../../../modules/actions/components/ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage.ts';
import { EComponentStateEditorStateSource } from '../../../modules/componentStateEditor';
import { useLocalEditorState } from '../../../modules/componentStateEditor/hooks';
import type { TWithClassname } from '../../../types/components';
import type { TComponentId } from '../../../types/domain/component';
import type { TComponentStateRevision } from '../../../types/domain/ComponentStateRevision';
import { Fail } from '../../../types/Fail';
import { EGrpcErrorCode } from '../../../types/GrpcError.ts';
import { useFunction } from '../../../utils/React/useFunction';
import { useNotifiedValueDescriptorObservable } from '../../../utils/React/useValueDescriptorObservable.ts';
import type { TValueDescriptor2 } from '../../../utils/ValueDescriptor/types.ts';
import {
    createSyncedValueDescriptor,
    createUnsyncedValueDescriptor,
    isFailValueDescriptor,
    isSyncedValueDescriptor,
    matchValueDescriptor,
    WAITING_VD,
} from '../../../utils/ValueDescriptor/utils.ts';
import { ConfigFullEditor } from '../../Editors/ConfigFullEditor';
import { EConfigEditorLanguages } from '../../Editors/types';
import { Empty } from '../../Empty';
import { Error as ErrorMessage } from '../../Error/view';
import { LoadingOverlay } from '../../overlays/LoadingOverlay';
import { Space } from '../../Space';
import { ConnectedRevisionSelector } from '../ConnectedRevisionSelector';
import { cnControls, cnEmptyRoot, cnRoot } from './styles.css';

type TProps = TWithClassname & {
    componentId: TComponentId;
    btRunNo: number;
};

type TData = TValueDescriptor2<string>;
type TCurrentComponentStateRevisionDesc = TValueDescriptor2<null | TComponentStateRevision>;

export function ConnectedComponentBTRunStates({ componentId, btRunNo, className }: TProps) {
    const traceId = useTraceId();
    const getComponentState = useModule(ModuleGetComponentStateOnCurrentStage);
    const subscribeToComponentStateRevisionsSnapshot = useModule(
        ModuleSubscribeToComponentStateRevisionsSnapshotOnCurrentStage,
    );
    const [editorState, setEditorState] = useLocalEditorState();
    const revisions = useNotifiedValueDescriptorObservable(
        subscribeToComponentStateRevisionsSnapshot({ componentId, btRunNo }, { traceId }),
    );

    useEffect(() => {
        if (isUndefined(editorState) && isSyncedValueDescriptor(revisions)) {
            const lastRevision = revisions.value.at(0);

            if (lastRevision) {
                setEditorState({
                    source: EComponentStateEditorStateSource.Editor,
                    revision: lastRevision.platformTime,
                });
            }
        }
    }, [editorState, revisions, setEditorState]);

    const currentRevision = useMemo<TCurrentComponentStateRevisionDesc>(
        () =>
            matchValueDescriptor(revisions, ({ value: revisions }) => {
                if (isUndefined(editorState)) return createSyncedValueDescriptor(null);

                const revision = revisions.find((r) => r.platformTime === editorState.revision);

                if (isUndefined(revision)) {
                    return createUnsyncedValueDescriptor(
                        Fail(EGrpcErrorCode.NOT_FOUND, {
                            message: 'Revision not found',
                            traceId,
                        }),
                    );
                }

                return createSyncedValueDescriptor(revision);
            }),
        [editorState, revisions, traceId],
    );

    const state = useNotifiedValueDescriptorObservable(
        useMemo(() => {
            const digest = currentRevision.value?.digest;
            if (isNil(digest)) return of<TData>(WAITING_VD);
            return getComponentState({ componentId, digest }, { traceId });
        }, [componentId, traceId, getComponentState, currentRevision.value?.digest]),
    );

    const changeRevision = useFunction((r: TComponentStateRevision) => {
        if (isUndefined(editorState)) return;

        setEditorState({
            source: EComponentStateEditorStateSource.User,
            revision: r.platformTime,
        });
    });

    if (isSyncedValueDescriptor(revisions) && isEmpty(revisions.value)) {
        return (
            <Empty
                className={cnEmptyRoot}
                description="The robot does not have a state for this run"
            />
        );
    }

    if (isFailValueDescriptor(state)) {
        return <ErrorMessage status="error" title="Unable to retrieve robot state" />;
    }

    if (
        !isSyncedValueDescriptor(state) ||
        !isSyncedValueDescriptor(revisions) ||
        !isSyncedValueDescriptor(currentRevision)
    ) {
        return (
            <LoadingOverlay
                text={
                    !isSyncedValueDescriptor(state)
                        ? 'Loading State...'
                        : !isSyncedValueDescriptor(revisions)
                          ? 'Loading revisions history...'
                          : !isSyncedValueDescriptor(currentRevision)
                            ? 'Loading current revision...'
                            : 'Loading...'
                }
            />
        );
    }

    return (
        <div className={cn(cnRoot, className)}>
            <ConfigFullEditor language={EConfigEditorLanguages.json} value={state.value} readOnly />
            <Space className={cnControls}>
                <ConnectedRevisionSelector
                    options={revisions.value}
                    current={currentRevision.value}
                    onChange={changeRevision}
                />
            </Space>
        </div>
    );
}
