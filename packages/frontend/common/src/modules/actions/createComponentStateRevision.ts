import { first, map, Observable, switchMap, tap } from 'rxjs';

import { TContextRef } from '../../di';
import { createComponentStateRevisionHandler } from '../../handlers/createComponentStateRevisionHandler';
import { ModuleMessages } from '../../lib/messages';
import { TComponentId } from '../../types/domain/component';
import { TSocketURL } from '../../types/domain/sockets';
import { FailFactory } from '../../types/Fail';
import { ValueDescriptor } from '../../types/ValueDescriptor';
import { TraceId } from '../../utils/traceId';
import {
    createFailDescriptor,
    createIdleDescriptor,
    createSynchronizedDescriptor,
    createUnsynchronizedDescriptor,
    matchValueDescriptor,
} from '../../utils/ValueDescriptor';
import { ModuleCommunication } from '../communication';

type TParams = {
    componentId: TComponentId;
    state: string;
    parentDigest?: string;
};
type TResult = {
    digest: string;
};
const ComponentStateRevisionCreateFail = FailFactory('createComponentStateRevision');
const UNKNOWN = ComponentStateRevisionCreateFail('UNKNOWN');
type TResultDescriptor = ValueDescriptor<TResult, typeof UNKNOWN, null>;

export function createComponentStateRevision(
    ctx: TContextRef,
    params: TParams,
    traceId: TraceId,
): Observable<TResultDescriptor> {
    const { update, currentSocketUrl$ } = ModuleCommunication(ctx);
    const { loading, success, error } = ModuleMessages(ctx);

    const closeMsg = loading('New state revision creation...');
    return currentSocketUrl$.pipe(
        first((url): url is TSocketURL => url !== undefined),
        switchMap((url) =>
            createComponentStateRevisionHandler(update, url, params, { traceId }).pipe(
                tap({
                    error: (err) => {
                        error(`Error creating state revision: ${err}`);
                    },
                }),
                map((result): TResultDescriptor => {
                    return matchValueDescriptor(result, {
                        idle: () => createIdleDescriptor(),
                        synchronized: (v) => {
                            closeMsg();
                            success('State revision created successfully');
                            return createSynchronizedDescriptor(
                                {
                                    digest: v.payload.digest,
                                },
                                null,
                            );
                        },
                        unsynchronized: () => createUnsynchronizedDescriptor(null),
                        fail: (f) => {
                            closeMsg();
                            error(`Error creating state revision: ${f.code}`);
                            return createFailDescriptor(UNKNOWN);
                        },
                    });
                }),
            ),
        ),
    );
}
