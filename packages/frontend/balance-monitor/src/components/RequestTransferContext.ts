import { createContext } from 'react';

import type { TConfirmationTransferAction } from '../widgets/WidgetTransferConfirmation/defs';

export const RequestTransferContext = createContext<
    ((props: TConfirmationTransferAction) => Promise<boolean>) | undefined
>(undefined);
