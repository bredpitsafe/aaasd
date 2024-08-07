import { useModule } from '../../../di/react.tsx';
import { ModuleBFF } from '../../../modules/bff/index.ts';
import type { TSocketName } from '../../../types/domain/sockets.ts';
import { useSyncObservable } from '../../../utils/React/useSyncObservable.ts';

export function useBFFStageName(): [TSocketName, (value: TSocketName) => void] {
    const { setCurrentBFFSocket, currentBffSocketName$ } = useModule(ModuleBFF);

    const currentBffSocketName = useSyncObservable(currentBffSocketName$) as TSocketName;

    return [currentBffSocketName, setCurrentBFFSocket];
}
