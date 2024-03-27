import {
    EAddTaskTabProps,
    EAddTaskTabSelectors,
} from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { ConnectedFormikStageSelect } from '@frontend/common/src/components/connectedComponents/ConnectedFormikStageSelect';
import { Space } from '@frontend/common/src/components/Space';
import { EApplicationName } from '@frontend/common/src/types/app';
import { FormikErrors } from 'formik';
import { isEmpty } from 'lodash-es';
import { ReactElement } from 'react';

import { TFormBacktestingTask } from '../defs';
import { cnServerSelectorContainer } from '../view.css';

type TTaskSubmitButtonProps = {
    isSubmitting: boolean;
    isValidating: boolean;
    errors: FormikErrors<TFormBacktestingTask>;
};

export function TaskSubmitButton(props: TTaskSubmitButtonProps): ReactElement {
    return (
        <Space.Compact className={cnServerSelectorContainer} block size="small">
            <ConnectedFormikStageSelect
                name="socketName"
                settingsStoreName={EApplicationName.BacktestingManager}
            />

            <Button
                {...EAddTaskTabProps[EAddTaskTabSelectors.CreateAndRunButton]}
                type="primary"
                htmlType={'submit'}
                size="small"
                disabled={props.isSubmitting || !isEmpty(props.errors)}
                loading={props.isSubmitting || props.isValidating}
            >
                Create and Run
            </Button>
        </Space.Compact>
    );
}
