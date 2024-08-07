import type { TraceId } from '@common/utils';
import { Modal } from '@frontend/common/src/components/Modals';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TTransferBlockingRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { lazily } from 'react-lazily';

const { WidgetTransferBlockingRuleForm } = lazily(
    () => import('../../widgets/layout/WidgetTransferBlockingRuleForm'),
);

export function useConnectedEditTransferBlockingRule(
    traceId: TraceId,
): (props: TTransferBlockingRuleInfo) => Promise<boolean> {
    const { show } = useModule(ModuleModals);

    return useFunction(
        (props: TTransferBlockingRuleInfo): Promise<boolean> =>
            new Promise((resolve) => {
                const modal = show(
                    <Modal
                        title="Edit Transfer Blocking Rule"
                        width="80vw"
                        open
                        footer={null}
                        onCancel={() => {
                            modal.destroy();
                            resolve(false);
                        }}
                        maskClosable={false}
                    >
                        <WidgetTransferBlockingRuleForm
                            traceId={traceId}
                            editTransferBlockingRule={props}
                            onUpsertedTransferBlockingRule={() => {
                                modal.destroy();
                                resolve(true);
                            }}
                        />
                    </Modal>,
                );
            }),
    );
}
