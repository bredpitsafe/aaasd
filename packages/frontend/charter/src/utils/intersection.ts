import type { TPoint } from '@frontend/common/src/types/shape';

import type { IContext } from '../types';

export function pointOnScreen(
    { state: { graphicsGap }, viewport: { screenWidth, screenHeight } }: IContext,
    point: TPoint,
): boolean {
    return (
        point.y > graphicsGap.t && // top
        point.y < screenHeight - graphicsGap.b && // bottom
        point.x > graphicsGap.l && // left
        point.x < screenWidth + graphicsGap.r // right
    );
}
