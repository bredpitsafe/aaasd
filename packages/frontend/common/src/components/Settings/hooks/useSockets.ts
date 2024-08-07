import { useMemo } from 'react';

import { useModule } from '../../../di/react';
import { ModuleSocketList } from '../../../modules/socketList';
import { SOCKET_STAR_NAME } from '../../../modules/socketList/defs';
import { ModuleSocketPage } from '../../../modules/socketPage';
import type { TSocketName } from '../../../types/domain/sockets';
import { useSyncObservable } from '../../../utils/React/useSyncObservable';

export function useSockets(): [TSocketName | undefined, TSocketName[] | undefined] {
    const { sockets$ } = useModule(ModuleSocketList);
    const { currentSocketName$ } = useModule(ModuleSocketPage);

    const sockets = useSyncObservable(sockets$);
    const publicSocketNames = useMemo(
        () =>
            sockets
                ? (Object.keys(sockets).filter((s) => s !== SOCKET_STAR_NAME) as TSocketName[])
                : undefined,
        [sockets],
    );
    const currentName = useSyncObservable(currentSocketName$);

    return [currentName, publicSocketNames];
}
