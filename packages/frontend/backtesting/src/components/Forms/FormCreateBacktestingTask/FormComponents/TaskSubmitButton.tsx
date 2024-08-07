import { LoadingOutlined } from '@ant-design/icons';
import {
    EAddTaskTabProps,
    EAddTaskTabSelectors,
} from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { ConnectedFormikStageSelect } from '@frontend/common/src/components/connectedComponents/ConnectedFormikStageSelect';
import { Space } from '@frontend/common/src/components/Space';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import type { FormikErrors } from 'formik';
import { isEmpty } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';

import type { TFormBacktestingTask } from '../defs';
import { cnServerSelectorContainer } from '../view.css';

type TTaskSubmitButtonProps = {
    isSubmitting: boolean;
    isValidating: boolean;
    errors: FormikErrors<TFormBacktestingTask>;
    onSubmit: VoidFunction;
};

export function TaskSubmitButton({
    isValidating,
    isSubmitting,
    errors,
    onSubmit,
}: TTaskSubmitButtonProps): ReactElement {
    const [submitPending, setSubmitPending] = useState(false);

    useEffect(() => {
        if (submitPending && isSubmitting) {
            setSubmitPending(false);
            return;
        }

        if (!submitPending || isValidating) {
            return;
        }

        setSubmitPending(false);

        if (isEmpty(errors)) {
            onSubmit();
        }
    }, [submitPending, isValidating, isSubmitting, errors, onSubmit]);

    const cbSubmit = useFunction(() => setSubmitPending(true));

    return (
        <Space.Compact className={cnServerSelectorContainer} block size="small">
            <ConnectedFormikStageSelect name="socketName" />

            <Button
                {...EAddTaskTabProps[EAddTaskTabSelectors.CreateAndRunButton]}
                type="primary"
                size="small"
                disabled={isSubmitting || !isEmpty(errors)}
                onClick={cbSubmit}
            >
                {(isSubmitting || isValidating) && <LoadingOutlined loop />}
                Create and Run
            </Button>
        </Space.Compact>
    );
}
