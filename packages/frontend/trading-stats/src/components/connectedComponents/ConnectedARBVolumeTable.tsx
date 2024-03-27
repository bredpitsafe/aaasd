import { ReactElement } from 'react';

import { ConnectedMonthly } from './ConnectedMonthly';

export function ConnectedARBVolumeTable(): ReactElement {
    return <ConnectedMonthly propName="volumeUsd" />;
}
