import { ReactElement } from 'react';

import { ConnectedMonthly } from './ConnectedMonthly';

export function ConnectedARBTakerTable(): ReactElement {
    return <ConnectedMonthly propName="takerVolumeUsd" />;
}
