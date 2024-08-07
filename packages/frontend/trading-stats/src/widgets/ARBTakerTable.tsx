import type { ReactElement } from 'react';

import { WidgetMonthly } from './Monthly.tsx';

export function WidgetARBTakerTable(): ReactElement {
    return <WidgetMonthly propName="takerVolumeUsd" />;
}
