import { generateTraceId } from '@common/utils';
import { useModule } from '@frontend/common/src/di/react';
import type { IModalShowResult } from '@frontend/common/src/lib/modals';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import { ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage.ts';
import { ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage } from '@frontend/common/src/modules/actions/accounts/ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage.ts';
import type {
    TNestedVirtualAccount,
    TRealAccount,
    TVirtualAccount,
} from '@frontend/common/src/types/domain/account';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isNil, noop } from 'lodash-es';
import { useMemo, useState } from 'react';

import { RealAccountSettingsModal } from '../components/Tables/TableRealAccounts/modals/RealAccountSettings';
import { VirtualAccountSettingsModal } from '../components/Tables/TableVirtualAccounts/modals/VirtualAccountSettings';

type TUseAccountsReturnType = {
    virtualAccounts?: TVirtualAccount[];
    realAccounts?: TRealAccount[];
    nestedAccounts?: TNestedVirtualAccount[];
    openModalVirtualAccount: (id?: TVirtualAccount['id']) => void;
    openModalRealAccount: (id?: TRealAccount['id'], clone?: boolean) => void;
};

export function useAccounts(): TUseAccountsReturnType {
    const subscribeToRealAccounts = useModule(ModuleSubscribeToRealAccountsSnapshotsOnCurrentStage);
    const subscribeToVirtualAccounts = useModule(
        ModuleSubscribeToVirtualAccountsSnapshotsOnCurrentStage,
    );

    const { show } = useModule(ModuleModals);

    const [modal, setModal] = useState<IModalShowResult>({
        destroy: noop,
    });

    const realAccounts = useNotifiedValueDescriptorObservable(
        subscribeToRealAccounts(undefined, { traceId: generateTraceId() }),
    );
    const virtualAccounts = useNotifiedValueDescriptorObservable(
        subscribeToVirtualAccounts(undefined, { traceId: generateTraceId() }),
    );

    const nestedAccounts: TNestedVirtualAccount[] | undefined = useMemo(() => {
        const realAccountsMap = realAccounts.value?.reduce(
            (map, realAccount) => {
                map[realAccount.id] = realAccount;
                return map;
            },
            {} as Record<TRealAccount['id'], TRealAccount>,
        );

        return isNil(realAccountsMap) || isNil(virtualAccounts)
            ? undefined
            : virtualAccounts.value?.map((acc) => {
                  return {
                      ...acc,
                      realAccounts: acc.realAccounts.map(({ id }) => {
                          return realAccountsMap[id];
                      }),
                  };
              });
    }, [realAccounts.value, virtualAccounts]);

    const cbCloseModal = useFunction(() => {
        modal.destroy();
    });

    const openModalVirtualAccount = useFunction((id?: TVirtualAccount['id']) => {
        const modal = show(<VirtualAccountSettingsModal accountId={id} onClose={cbCloseModal} />);
        setModal(modal);
    });

    const openModalRealAccount = useFunction((id?: TRealAccount['id']) => {
        const modal = show(<RealAccountSettingsModal accountId={id} onCancel={cbCloseModal} />);
        setModal(modal);
    });

    return {
        nestedAccounts,
        openModalRealAccount,
        openModalVirtualAccount,
        realAccounts: realAccounts.value ?? undefined,
        virtualAccounts: virtualAccounts.value ?? undefined,
    };
}
