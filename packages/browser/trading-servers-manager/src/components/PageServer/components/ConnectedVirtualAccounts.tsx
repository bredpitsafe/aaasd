import { ReactElement } from 'react';

import { useAccounts } from '../../../hooks/useAccounts';
import { TableVirtualAccountsView } from '../../Tables/TableVirtualAccounts/view';

export function ConnectedVirtualAccounts(): ReactElement {
    const { nestedAccounts, openModalVirtualAccount, openModalRealAccount, updating } =
        useAccounts();

    return (
        <TableVirtualAccountsView
            loading={updating}
            accounts={nestedAccounts}
            onEdit={openModalVirtualAccount}
            onEditReal={openModalRealAccount}
        />
    );
}
