import type { ReactElement } from 'react';

import { WidgetMonthly } from './Monthly.tsx';

export function WidgetARBMakerTable(): ReactElement {
    return <WidgetMonthly propName="makerVolumeUsd" />;
}
