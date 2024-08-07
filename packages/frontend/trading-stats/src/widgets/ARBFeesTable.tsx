import type { ReactElement } from 'react';

import { WidgetMonthly } from './Monthly.tsx';

export function WidgetARBFeesTable(): ReactElement {
    return <WidgetMonthly propName="feeAmountUsd" />;
}
