import { isClamped } from '@frontend/common/src/utils/isClamped';

import { getTimeNow } from '../Charter/methods';
import type { IContext } from '../types';

export function viewportFocusedOnNow({ state, viewport }: IContext): boolean {
    return isClamped(
        getTimeNow(state) - (state.clientTimeIncrement + state.serverTimeIncrement),
        viewport.getLeft(),
        viewport.getRight(),
    );
}
