import type { TraceId } from '@common/utils';
import { Modal } from '@frontend/common/src/components/Modals';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TAutoTransferRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { lazily } from 'react-lazily';

const { WidgetAutoTransferRuleForm } = lazily(
    () => import('../../widgets/layout/WidgetAutoTransferRuleForm'),
);

export function useConnectedEditAutoTransferRule(
    traceId: TraceId,
): (props: TAutoTransferRuleInfo) => Promise<boolean> {
    const { show } = useModule(ModuleModals);

    return useFunction(
        async (props: TAutoTransferRuleInfo): Promise<boolean> =>
            new Promise((resolve) => {
                const modal = show(
                    <Modal
                        title="Edit Auto Transfer Rule"
                        width="80vw"
                        open
                        footer={null}
                        onCancel={() => {
                            modal.destroy();
                            resolve(false);
                        }}
                        maskClosable={false}
                    >
                        <WidgetAutoTransferRuleForm
                            traceId={traceId}
                            editAutoTransferRule={props}
                            onUpsertedAutoTransferRule={() => {
                                modal.destroy();
                                resolve(true);
                            }}
                        />
                    </Modal>,
                );
            }),
    );
}
