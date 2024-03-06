import { useModule } from '@frontend/common/src/di/react';
import { TUpdatableRealAccount } from '@frontend/common/src/handlers/accounts/def';
import { IModalShowResult, ModuleModals } from '@frontend/common/src/lib/modals';
import {
    TNestedVirtualAccount,
    TRealAccount,
    TVirtualAccount,
} from '@frontend/common/src/types/domain/account';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { noop } from 'lodash-es';
import { useMemo, useState } from 'react';
import { useObservable } from 'react-use';
import { lastValueFrom } from 'rxjs';

import { RealAccountSettingsModal } from '../components/Tables/TableRealAccounts/modals/RealAccountSettings';
import { VirtualAccountSettingsModal } from '../components/Tables/TableVirtualAccounts/modals/VirtualAccountSettings';
import { ModuleTradingServersManagerActions } from '../modules/actions/module';

type TUseAccountsReturnType = {
    virtualAccounts?: TVirtualAccount[];
    realAccounts?: TRealAccount[];
    nestedAccounts?: TNestedVirtualAccount[];
    openModalVirtualAccount: (id?: TVirtualAccount['id']) => void;
    openModalRealAccount: (id?: TRealAccount['id']) => void;
    updating: boolean;
};

export function useAccounts(): TUseAccountsReturnType {
    const {
        subscribeToVirtualAccounts,
        subscribeToRealAccounts,
        updateVirtualAccounts,
        createVirtualAccounts,
        updateRealAccounts,
        createRealAccounts,
    } = useModule(ModuleTradingServersManagerActions);

    const { show, confirm } = useModule(ModuleModals);

    const [modal, setModal] = useState<IModalShowResult>({
        destroy: noop,
    });
    const [updating, setUpdating] = useState(false);

    const realAccounts$ = useMemo(() => subscribeToRealAccounts(), [subscribeToRealAccounts]);
    const realAccounts = useObservable(realAccounts$);

    const virtualAccounts$ = useMemo(
        () => subscribeToVirtualAccounts(),
        [subscribeToVirtualAccounts],
    );
    const virtualAccounts = useObservable(virtualAccounts$);

    const realAccountsMap = useMemo(
        () =>
            realAccounts?.reduce(
                (map, realAccount) => {
                    map[realAccount.id] = realAccount;
                    return map;
                },
                {} as Record<TRealAccount['id'], TRealAccount>,
            ),
        [realAccounts],
    );

    const nestedAccounts: TNestedVirtualAccount[] | undefined = useMemo(
        () =>
            virtualAccounts?.map((acc) => {
                return {
                    ...acc,
                    realAccounts: acc.realAccounts.map(({ id }) => {
                        return realAccountsMap![id];
                    }),
                };
            }),
        [virtualAccounts, realAccountsMap],
    );

    const cbSaveVirtualAccount = useFunction(
        async (
            id: TVirtualAccount['id'] | undefined,
            name: TVirtualAccount['name'],
            realAccountIds: TRealAccount['id'][],
        ) => {
            const acc =
                id !== undefined ? virtualAccounts?.find((acc) => acc.id === id) : undefined;

            try {
                const res = await confirm(`Do you want to save virtual account "${name}"?`);
                if (res) {
                    setUpdating(true);
                    if (acc) {
                        await lastValueFrom(
                            updateVirtualAccounts([
                                {
                                    ...acc,
                                    name,
                                    realAccounts: realAccountIds.map((id) => ({
                                        id,
                                    })),
                                },
                            ]),
                        );
                    } else {
                        await lastValueFrom(createVirtualAccounts([{ name, realAccountIds }]));
                    }
                    cbCloseModal();
                }
            } finally {
                setUpdating(false);
            }
        },
    );

    const cbSaveRealAccount = useFunction(async (acc: TUpdatableRealAccount) => {
        try {
            const res = await confirm(`Do you want to save real account "${acc.name}"?`);
            if (res) {
                setUpdating(true);
                if (acc.id) {
                    await lastValueFrom(updateRealAccounts([acc]));
                } else {
                    await lastValueFrom(createRealAccounts([acc]));
                }
                cbCloseModal();
            }
        } finally {
            setUpdating(false);
        }
    });

    const cbCloseModal = useFunction(() => {
        modal.destroy();
    });

    const openModalVirtualAccount = useFunction((id?: TVirtualAccount['id']) => {
        const account = virtualAccounts?.find((acc) => acc.id === id);

        const modal = show(
            <VirtualAccountSettingsModal
                account={account}
                realAccounts={realAccounts}
                onCancel={cbCloseModal}
                onSave={cbSaveVirtualAccount}
            />,
        );
        setModal(modal);
    });

    const openModalRealAccount = useFunction((id?: TRealAccount['id']) => {
        const account = realAccounts?.find((acc) => acc.id === id);
        const modal = show(
            <RealAccountSettingsModal
                account={account}
                onCancel={cbCloseModal}
                onSave={cbSaveRealAccount}
            />,
        );
        setModal(modal);
    });

    return {
        updating,
        openModalVirtualAccount,
        openModalRealAccount,
        virtualAccounts,
        realAccounts,
        nestedAccounts,
    };
}
