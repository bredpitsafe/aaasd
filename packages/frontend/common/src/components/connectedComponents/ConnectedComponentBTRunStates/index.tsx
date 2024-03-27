import cn from 'classnames';
import { isEmpty, isUndefined } from 'lodash-es';
import { useEffect, useMemo } from 'react';
import { map, Observable, of } from 'rxjs';

import { useModule } from '../../../di/react';
import { IModuleBaseActions, ModuleBaseActions } from '../../../modules/actions';
import { EComponentStateEditorStateSource } from '../../../modules/componentStateEditor';
import { useLocalEditorState } from '../../../modules/componentStateEditor/hooks';
import { TWithClassname } from '../../../types/components';
import { TComponentId } from '../../../types/domain/component';
import { TComponentStateRevision } from '../../../types/domain/ComponentStateRevision';
import { Fail, FailFactory, TFail } from '../../../types/Fail';
import { ValueDescriptor } from '../../../types/ValueDescriptor';
import { assertNever } from '../../../utils/assert';
import { useFunction } from '../../../utils/React/useFunction';
import { useValueDescriptorObservableDeprecated } from '../../../utils/React/useValueDescriptorObservableDeprecated';
import { generateTraceId, TraceId } from '../../../utils/traceId';
import {
    FailDesc,
    isFailDesc,
    isSyncDesc,
    matchDesc,
    SyncDesc,
    UnscDesc,
} from '../../../utils/ValueDescriptor';
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
const ConnectedComponentBTRunStatesFail = FailFactory('ConnectedComponentBTRunStates');
const NO_STATE = ConnectedComponentBTRunStatesFail('NO_STATE');
const UNKNOWN = ConnectedComponentBTRunStatesFail('UNKNOWN');
type TData = ValueDescriptor<string, typeof NO_STATE | typeof UNKNOWN, null>;
type TCurrentComponentStateRevisionDesc = ValueDescriptor<
    TComponentStateRevision,
    TFail<'NOT_FOUND' | 'UNKNOWN'>,
    null
>;

export function ConnectedComponentBTRunStates({ componentId, btRunNo, className }: TProps) {
    const traceId = useMemo(() => generateTraceId(), []);
    const { getComponentStateRevisions, getComponentState } = useModule(ModuleBaseActions);
    const [editorState, setEditorState] = useLocalEditorState();
    const revisions = useValueDescriptorObservableDeprecated(
        getComponentStateRevisions({ componentId, btRunNo }, traceId),
    );

    useEffect(() => {
        if (isUndefined(editorState) && isSyncDesc(revisions)) {
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
            matchDesc(revisions, {
                idle: () => UnscDesc(null),
                unsynchronized: () => UnscDesc(null),
                synchronized: (revisions) => {
                    if (isUndefined(editorState)) return UnscDesc(null);

                    const revision = revisions.find((r) => r.platformTime === editorState.revision);

                    if (isUndefined(revision)) return FailDesc(Fail('NOT_FOUND'));

                    return SyncDesc(revision, null);
                },
                fail: () => FailDesc(Fail('UNKNOWN')),
            }),
        [editorState, revisions],
    );

    const state = useValueDescriptorObservableDeprecated(
        useMemo(
            () => getData$(componentId, traceId, getComponentState, currentRevision.value?.digest),
            [componentId, traceId, getComponentState, currentRevision],
        ),
    );

    const changeRevision = useFunction((r: TComponentStateRevision) => {
        if (isUndefined(editorState)) return;

        setEditorState({
            source: EComponentStateEditorStateSource.User,
            revision: r.platformTime,
        });
    });

    if (isSyncDesc(revisions) && isEmpty(revisions.value)) {
        return (
            <Empty
                className={cnEmptyRoot}
                description="The robot does not have a state for this run"
            />
        );
    }

    if (isFailDesc(state)) {
        const { code } = state.fail;
        switch (code) {
            case '[ConnectedComponentBTRunStates]: NO_STATE':
                return <ErrorMessage status="info" title="The robot does not have a state" />;
            case '[ConnectedComponentBTRunStates]: UNKNOWN':
                return <ErrorMessage status="error" title="Unable to retrieve robot state" />;
            default:
                assertNever(code);
        }
    }

    if (!isSyncDesc(state) || !isSyncDesc(revisions) || !isSyncDesc(currentRevision)) {
        return (
            <LoadingOverlay
                text={
                    !isSyncDesc(state)
                        ? 'Loading State...'
                        : !isSyncDesc(revisions)
                          ? 'Loading revisions history...'
                          : !isSyncDesc(currentRevision)
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

function getData$(
    componentId: TComponentId,
    traceId: TraceId,
    getComponentState: IModuleBaseActions['getComponentState'],
    digest?: string,
): Observable<TData> {
    if (isUndefined(digest)) return of<TData>(UnscDesc(null));

    return getComponentState({ componentId, digest }, traceId).pipe(
        map(
            (stateDesc): TData =>
                matchDesc(stateDesc, {
                    idle: () => UnscDesc(null),
                    unsynchronized: () => UnscDesc(null),
                    synchronized: (state) => SyncDesc(state, null),
                    fail: () => FailDesc(UNKNOWN),
                }),
        ),
    );
}
