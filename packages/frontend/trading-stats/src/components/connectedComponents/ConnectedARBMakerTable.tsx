import { ReactElement } from 'react';

import { ConnectedMonthly } from './ConnectedMonthly';

export function ConnectedARBMakerTable(): ReactElement {
    return <ConnectedMonthly propName="makerVolumeUsd" />;
}
