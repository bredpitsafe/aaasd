import { distinctUntilChanged, shareReplay } from 'rxjs';

import { ECommonSettings } from '../../components/Settings/def';
import { ModuleFactory } from '../../di';
import type { TSocketName } from '../../types/domain/sockets';
import { isProductionDomain } from '../../utils/environment';
import { getLocalStorageValue, setLocalStorageValue } from '../../utils/localStorage';
import { createObservableBox } from '../../utils/rx';
import { ModuleSocketPage } from '../socketPage';
import {
    BFF_MS_SOCKET_NAME,
    BFF_PROD_SOCKET_NAME,
    bffSocketsList$,
    getCurrentBffSocket$,
} from './data';

const defaultSocketName = isProductionDomain() ? BFF_PROD_SOCKET_NAME : BFF_MS_SOCKET_NAME;

const boxCurrentBffSocket = createObservableBox<TSocketName>(
    (getLocalStorageValue(ECommonSettings.BFFServiceStage) as TSocketName) ?? defaultSocketName,
);

const currentBffSocketName$ = boxCurrentBffSocket.obs.pipe(distinctUntilChanged(), shareReplay(1));

export const ModuleBFF = ModuleFactory((ctx) => {
    const { currentSocketName$ } = ModuleSocketPage(ctx);

    const setCurrentBFFSocket = (value: TSocketName) => {
        boxCurrentBffSocket.set(value);
        setLocalStorageValue(ECommonSettings.BFFServiceStage, value);
    };

    return {
        bffSocketsList$,
        getCurrentBFFSocket$: getCurrentBffSocket$.bind(
            null,
            currentBffSocketName$,
            // TODO: It may be a mistake later to decide that `requestStage` *always* corresponds to currentSocketName,
            // but passing that param from the caller will require quite a lot of work.
            // Should do it if it's required later somewhere in the system.
            currentSocketName$,
        ),
        setCurrentBFFSocket,
        currentBffSocketName$,
    };
});
