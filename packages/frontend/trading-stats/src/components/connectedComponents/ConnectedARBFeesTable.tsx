import { ReactElement } from 'react';

import { ConnectedMonthly } from './ConnectedMonthly';

export function ConnectedARBFeesTable(): ReactElement {
    return <ConnectedMonthly propName="feeAmountUsd" />;
}
