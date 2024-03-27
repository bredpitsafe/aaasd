import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import { EMPTY } from 'rxjs';
import { filter } from 'rxjs/operators';

import { useModule } from '../../di/react';
import { ModuleBaseActions } from '../../modules/actions';
import { ModuleCommunication } from '../../modules/communication';
import type { EComponentType, TComponentConfig, TComponentId } from '../../types/domain/component';
import { useSyncObservable } from '../../utils/React/useSyncObservable';

export function useConnectedComponentConfig(
    componentType: EComponentType,
    componentId: TComponentId,
): TComponentConfig | undefined {
    const { currentSocketUrl$ } = useModule(ModuleCommunication);
    const { subscribeComponentConfigUpdates$ } = useModule(ModuleBaseActions);

    const socketUrl = useSyncObservable(currentSocketUrl$);

    const config$ = useMemo(() => {
        if (isNil(socketUrl)) {
            return EMPTY;
        }

        return subscribeComponentConfigUpdates$(socketUrl, componentId, null).pipe(
            filter((config) => !isNil(config)),
        );
    }, [componentId, socketUrl, subscribeComponentConfigUpdates$]);

    return useSyncObservable(config$);
}
