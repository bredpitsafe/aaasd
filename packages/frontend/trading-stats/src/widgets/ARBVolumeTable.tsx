import type { ReactElement } from 'react';

import { WidgetMonthly } from './Monthly.tsx';

export function WidgetARBVolumeTable(): ReactElement {
    return <WidgetMonthly propName="volumeUsd" />;
}
