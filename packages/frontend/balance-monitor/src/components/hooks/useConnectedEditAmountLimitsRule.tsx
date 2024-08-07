import type { TraceId } from '@common/utils';
import { Modal } from '@frontend/common/src/components/Modals';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleModals } from '@frontend/common/src/lib/modals';
import type { TAmountLimitsRuleInfo } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { lazily } from 'react-lazily';

const { WidgetAmountLimitsRuleForm } = lazily(
    () => import('../../widgets/layout/WidgetAmountLimitsRuleForm'),
);

export function useConnectedEditAmountLimitsRule(
    traceId: TraceId,
): (props: TAmountLimitsRuleInfo) => Promise<boolean> {
    const { show } = useModule(ModuleModals);

    return useFunction(
        async (props: TAmountLimitsRuleInfo): Promise<boolean> =>
            new Promise((resolve) => {
                const modal = show(
                    <Modal
                        title="Edit Amount Limit Rule"
                        width="80vw"
                        open
                        footer={null}
                        onCancel={() => {
                            modal.destroy();
                            resolve(false);
                        }}
                        maskClosable={false}
                    >
                        <WidgetAmountLimitsRuleForm
                            traceId={traceId}
                            editAmountLimitsRule={props}
                            onUpsertedAmountLimitsRule={() => {
                                modal.destroy();
                                resolve(true);
                            }}
                        />
                    </Modal>,
                );
            }),
    );
}
