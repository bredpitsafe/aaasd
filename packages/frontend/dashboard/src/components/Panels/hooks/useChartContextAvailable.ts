import { isLastFocusedTab$ } from '@frontend/common/src/utils/observable/isLastFocusedTab';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { useEffect } from 'react';
import { useToggle } from 'react-use';

export function useChartContextAvailable(): {
    hasContext: boolean;
    onWebGLContextLost: VoidFunction;
} {
    const [hasContext, setHasContext] = useToggle(true);
    const webGLContextLost = useFunction(() => setHasContext(false));
    const isTabActive = useSyncObservable(isLastFocusedTab$, true);

    useEffect(() => {
        if (isTabActive) {
            setHasContext(true);
        }
    }, [isTabActive, setHasContext]);

    return { hasContext, onWebGLContextLost: webGLContextLost };
}
