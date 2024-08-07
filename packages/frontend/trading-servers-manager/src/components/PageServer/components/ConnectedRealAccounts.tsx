import type { ReactElement } from 'react';

import { useAccounts } from '../../../hooks/useAccounts';
import { TableRealAccountsView } from '../../Tables/TableRealAccounts/view';

export function ConnectedRealAccounts(): ReactElement {
    const { realAccounts, openModalRealAccount } = useAccounts();

    return <TableRealAccountsView realAccounts={realAccounts} onEdit={openModalRealAccount} />;
}
