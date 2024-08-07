import { ModuleFactory } from '@frontend/common/src/di';
import { createModule as createSocketListModule } from '@frontend/common/src/modules/socketList/createModule';
import type {
    TSocketMap,
    TSocketName,
    TSocketStruct,
} from '@frontend/common/src/types/domain/sockets';
import { createObservableBox } from '@frontend/common/src/utils/rx';
import { isNil } from 'lodash-es';
import type { Observable } from 'rxjs';
import { combineLatest } from 'rxjs';
import { filter, map, shareReplay } from 'rxjs/operators';

const createModule = () => {
    const { sockets$, setSockets, socketNames$ } = createSocketListModule();
    const boxCurrentStageName = createObservableBox<TSocketName | undefined>(undefined);

    const currentStage$: Observable<TSocketStruct> = combineLatest([
        boxCurrentStageName.obs,
        sockets$,
    ]).pipe(
        filter((v): v is [TSocketName, TSocketMap] => {
            const [currentName, socketsMap] = v;
            return !isNil(currentName) && !isNil(socketsMap);
        }),
        map(([name, socketsMap]) => {
            const url = socketsMap[name];
            return { name, url };
        }),
        shareReplay({ bufferSize: 1, refCount: true }),
    );

    return {
        stageNames$: socketNames$,
        setStages: setSockets,
        currentStage$,
        setCurrentStageName: boxCurrentStageName.set,
    };
};
export const ModuleServiceStage = ModuleFactory(createModule);
