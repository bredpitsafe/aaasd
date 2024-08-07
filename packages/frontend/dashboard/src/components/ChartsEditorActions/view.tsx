import {
    DashboardEditModalProps,
    EDashboardEditModal,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.edit.modal';
import { Button } from '@frontend/common/src/components/Button';
import { Space } from '@frontend/common/src/components/Space';
import type { TWithClassname } from '@frontend/common/src/types/components';
import cn from 'classnames';
import type { ReactElement } from 'react';

import { cnButtons } from './view.css';

type TChartsEditorActionsProps = {
    handleApply?: () => void | Promise<void> | Promise<boolean>;
    handleDiscard?: () => void;
    isProcessing?: boolean;
    isDirty?: boolean;
    isAllFieldsValid?: boolean;
    applyButtonClassName?: string;
} & TWithClassname;

export function ChartsEditorActions({
    handleApply,
    handleDiscard,
    isProcessing,
    isDirty,
    isAllFieldsValid,
    className,
    ...props
}: TChartsEditorActionsProps): ReactElement {
    return (
        <Space className={cn(cnButtons, className)}>
            {handleApply && (
                <Button
                    {...DashboardEditModalProps[EDashboardEditModal.ApplyChartsButton]}
                    className={props.applyButtonClassName}
                    disabled={!isDirty || isProcessing || !isAllFieldsValid}
                    loading={isProcessing}
                    onClick={handleApply}
                    type="primary"
                >
                    Apply
                </Button>
            )}
            {handleDiscard && (
                <Button
                    {...DashboardEditModalProps[EDashboardEditModal.DiscardChartsButton]}
                    disabled={!isDirty || isProcessing}
                    loading={isProcessing}
                    onClick={handleDiscard}
                >
                    Discard
                </Button>
            )}
        </Space>
    );
}
