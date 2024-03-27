import { TContextRef } from '@frontend/common/src/di';
import { ModuleGetListHerodotusTradesResource } from '@frontend/common/src/handlers/getListHerodotusTradesHandle';
import { ModuleSocketPage } from '@frontend/common/src/modules/socketPage';
import { TRobotId } from '@frontend/common/src/types/domain/robots';
import { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { generateTraceId, TraceId } from '@frontend/common/src/utils/traceId';
import { THerodotusTaskId, THerodotusTrade } from '@frontend/herodotus/src/types/domain';
import { Observable, take } from 'rxjs';
import { filter, switchMap } from 'rxjs/operators';

export function getListHerodotusTrades(
    ctx: TContextRef,
    taskId: THerodotusTaskId,
    robotId: TRobotId,
    traceId: TraceId = generateTraceId(),
): Observable<{
    trades: THerodotusTrade[];
}> {
    const { currentSocketUrl$ } = ModuleSocketPage(ctx);
    const getListHerodotusTradesHandler = ModuleGetListHerodotusTradesResource(ctx);

    return currentSocketUrl$.pipe(
        filter((url): url is TSocketURL => url !== undefined),
        switchMap((url) => getListHerodotusTradesHandler(url, { taskId, robotId }, { traceId })),
        take(1),
    );
}
