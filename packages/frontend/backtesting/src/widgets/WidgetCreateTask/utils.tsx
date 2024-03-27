import type {
    TBacktestingTaskRobot,
    TValidationTemplateErrors,
} from '@frontend/common/src/types/domain/backtestings';
import { logger } from '@frontend/common/src/utils/Tracing';
import type { FormikErrors } from 'formik/dist/types';
import { isNil, isString } from 'lodash-es';

import type {
    TFormBacktestingTask,
    TValidFormBacktestingTask,
} from '../../components/Forms/FormCreateBacktestingTask/defs';

export function convertTemplateErrors2FormikErrors(
    values: TFormBacktestingTask,
    errors: null | TValidationTemplateErrors[],
): FormikErrors<TValidFormBacktestingTask> | true {
    if (isNil(errors) || errors.length === 0) {
        return true;
    }

    const validationError: FormikErrors<TValidFormBacktestingTask> = {};

    for (const templateError of errors) {
        if ('template' in templateError) {
            for (const { error, kind } of templateError.template) {
                if (kind === 'taskConfig') {
                    validationError.configTemplate = error;
                    continue;
                }

                if ('robotConfig' in kind) {
                    const robotIndex = values.robots?.findIndex(
                        (robot) =>
                            kind.robotConfig.name === robot.name &&
                            kind.robotConfig.kind === robot.kind,
                    );

                    if (isNil(robotIndex) || robotIndex < 0) {
                        logger.error(
                            `Template error contains robot which doesn't exist when validating Backtesting Task`,
                        );
                        continue;
                    }

                    if (isNil(validationError.robots)) {
                        validationError.robots = [];
                    }

                    (validationError.robots[robotIndex] as FormikErrors<TBacktestingTaskRobot>) = {
                        configTemplate: error,
                    };
                }

                logger.error(
                    `Unknown validation template error kind received when validating Backtesting Task`,
                );
            }
            continue;
        }

        if ('variables' in templateError) {
            validationError.variablesTemplate =
                isNil(templateError.variables) || isString(templateError.variables)
                    ? templateError.variables ?? ''
                    : JSON.stringify(templateError.variables);
            continue;
        }

        logger.error(`Unknown validation error received when validating Backtesting Task`);
    }

    return validationError;
}
