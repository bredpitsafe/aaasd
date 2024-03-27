import { ReactElement } from 'react';

import { useAccounts } from '../../../hooks/useAccounts';
import { TableRealAccountsView } from '../../Tables/TableRealAccounts/view';

export function ConnectedRealAccounts(): ReactElement {
    const { realAccounts, openModalRealAccount, updating } = useAccounts();

    return (
        <TableRealAccountsView
            loading={updating}
            realAccounts={realAccounts}
            onEdit={openModalRealAccount}
        />
    );
}
