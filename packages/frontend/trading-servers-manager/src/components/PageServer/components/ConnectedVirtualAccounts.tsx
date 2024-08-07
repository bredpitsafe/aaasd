import type { ReactElement } from 'react';

import { useAccounts } from '../../../hooks/useAccounts';
import { TableVirtualAccountsView } from '../../Tables/TableVirtualAccounts/view';

export function ConnectedVirtualAccounts(): ReactElement {
    const { nestedAccounts, openModalVirtualAccount, openModalRealAccount } = useAccounts();

    return (
        <TableVirtualAccountsView
            accounts={nestedAccounts}
            onEdit={openModalVirtualAccount}
            onEditReal={openModalRealAccount}
        />
    );
}
