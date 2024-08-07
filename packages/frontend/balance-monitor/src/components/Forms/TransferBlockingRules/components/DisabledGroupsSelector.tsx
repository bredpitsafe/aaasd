import {
    AddTransferBlockingRuleTabProps,
    EAddTransferBlockingRuleTabSelectors,
} from '@frontend/common/e2e/selectors/balance-monitor/components/add-transfer-blocking-rule/add-transfer-bloking-rule.tab.selectors';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import type { ReactNode } from 'react';
import { memo } from 'react';

export const DisabledGroupsSelector = memo(({ className }: TWithClassname) => {
    return (
        <FormikForm.Item className={className} name="disabledGroups" label="Disabled">
            <FormikSelect
                {...AddTransferBlockingRuleTabProps[
                    EAddTransferBlockingRuleTabSelectors.DisabledSelector
                ]}
                name="disabledGroups"
                options={
                    [
                        { label: 'Suggest + Manual', value: ERuleGroups.All },
                        { label: 'Suggest', value: ERuleGroups.Suggest },
                        { label: 'Manual', value: ERuleGroups.Manual },
                    ] as { label: ReactNode; value: ERuleGroups }[]
                }
            />
        </FormikForm.Item>
    );
});
