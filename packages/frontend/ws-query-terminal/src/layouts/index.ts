import type { TPageLayouts } from '@frontend/common/src/modules/layouts/data';

import { compactTerminalLayout } from './compactTerminal';
import { defaultTerminalLayout } from './terminal';

export enum ELayoutIds {
    Terminal = 'default',
    TerminalEmbedded = 'compact',
}

export const DEFAULT_LAYOUTS: TPageLayouts = {
    [ELayoutIds.Terminal]: {
        id: ELayoutIds.Terminal,
        value: defaultTerminalLayout,
        version: 1,
    },
    [ELayoutIds.TerminalEmbedded]: {
        id: ELayoutIds.TerminalEmbedded,
        value: compactTerminalLayout,
        version: 1,
    },
};
