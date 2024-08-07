import type { TimeZone } from '@common/types';
import { createTestProps } from '@frontend/common/e2e';
import {
    BacktestingProps,
    EBacktestingSelectors,
} from '@frontend/common/e2e/selectors/backtesting/backtesting.page.selectors';
import {
    EAddTaskTabProps,
    EAddTaskTabSelectors,
} from '@frontend/common/e2e/selectors/backtesting/components/add-task-tab/add-task.tab.selectors';
import {
    DetailsTabProps,
    EDetailsTabSelectors,
} from '@frontend/common/e2e/selectors/backtesting/components/details-tab/details.tab.selectors';
import { ECalendarSelectors } from '@frontend/common/e2e/selectors/calendar.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { EConfigEditorLanguages } from '@frontend/common/src/components/Editors/types';
import { FormikForm, FormikInput } from '@frontend/common/src/components/Formik';
import { FormikConfigEditor } from '@frontend/common/src/components/Formik/components/FormikConfigEditor';
import { FormikDatePicker } from '@frontend/common/src/components/Formik/components/FormikDataPicker';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { Space } from '@frontend/common/src/components/Space';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const.ts';
import { cnCol, cnRow } from '@frontend/common/src/utils/css/common.css';
import { useAggregate } from '@frontend/common/src/utils/React/useAggregate.ts';
import cn from 'classnames';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import type { FormikProps } from 'formik';
import type { RangePickerProps } from 'formik-antd';
import { isEmpty, isNil, range, uniq } from 'lodash-es';
import type { DisabledTime } from 'rc-picker/es/interface';
import { memo, useMemo } from 'react';

import type { TFormBacktestingTask, TFormCreateBacktestingTaskProps } from '../defs';
import { EFieldName } from '../defs';
import {
    cnConfigEditor,
    cnConfigEditorFormItem,
    cnConfigWithoutResizer,
    cnDatePicker,
    cnInput,
    cnRoot,
    cnScoreDateContainer,
    cnTimes,
    cnUpdateButton,
} from '../view.css';

type TTaskCommonTabFormProps = Pick<TFormCreateBacktestingTaskProps, 'readonly' | 'onSubmit'> & {
    formik: FormikProps<TFormBacktestingTask>;
    timeZone: TimeZone;
};

const disabledDate: RangePickerProps['disabledDate'] = (current) => {
    // Can not select days after today
    return current && current > dayjs().endOf('day');
};

const disabledTime: DisabledTime<Dayjs> = (current) => {
    if (isNil(current)) {
        return {};
    }
    const now = dayjs().utc();
    const isToday = current.date() === now.date();
    const isCurrentHour = isToday && current.hour() === now.hour();
    return {
        disabledHours: () => (isToday ? range(now.hour() + 1, 24) : []),
        disabledMinutes: () => (isCurrentHour ? range(now.minute() + 1, 60) : []),
    };
};

export const TaskCommonTabForm = memo(
    ({ formik, readonly, timeZone, onSubmit }: TTaskCommonTabFormProps) => {
        const fullScoreIndicatorsList = useAggregate(
            formik.values.scoreIndicatorsList,
            (previous, next) => uniq([...previous, ...next]),
            EMPTY_ARRAY as string[],
        );
        const options = useMemo(
            () =>
                fullScoreIndicatorsList.map((indicatorName) => ({
                    label: indicatorName,
                    value: indicatorName,
                })),
            [fullScoreIndicatorsList],
        );

        return (
            <div className={cnRoot}>
                <div className={cnCol}>
                    <div className={cnRow}>
                        <FormikForm.Item name={EFieldName.Name} className={cnInput} label="Name">
                            <FormikInput
                                {...BacktestingProps[EBacktestingSelectors.NameInput]}
                                name={EFieldName.Name}
                            />
                        </FormikForm.Item>
                        {readonly && !isNil(onSubmit) && (
                            <FormikForm.Item name="submit" className={cnUpdateButton}>
                                <Button
                                    {...DetailsTabProps[EDetailsTabSelectors.UpdateButton]}
                                    type="primary"
                                    htmlType={'submit'}
                                    disabled={formik.isSubmitting || !isEmpty(formik.errors)}
                                    loading={formik.isSubmitting}
                                >
                                    Update
                                </Button>
                            </FormikForm.Item>
                        )}
                    </div>
                    <FormikForm.Item name={EFieldName.Description} label="Description">
                        <FormikInput.TextArea
                            {...BacktestingProps[EBacktestingSelectors.DescriptionInput]}
                            name={EFieldName.Description}
                            autoSize
                        />
                    </FormikForm.Item>
                    <Space size="middle" wrap align="start" className={cnScoreDateContainer}>
                        <FormikForm.Item
                            name={EFieldName.ScoreIndicatorsList}
                            label="Score Indicators"
                        >
                            <FormikSelect
                                {...BacktestingProps[EBacktestingSelectors.ScoreIndicatorInput]}
                                name={EFieldName.ScoreIndicatorsList}
                                options={options}
                                mode="tags"
                                allowClear
                            ></FormikSelect>
                        </FormikForm.Item>
                        <FormikForm.Item name="simulationInverval" label="Simulation interval">
                            <div className={cnTimes}>
                                <FormikForm.Item name={EFieldName.StartTime}>
                                    <FormikDatePicker
                                        {...createTestProps(ECalendarSelectors.StartDateInput)}
                                        className={cnDatePicker}
                                        name={EFieldName.StartTime}
                                        disabled={readonly}
                                        timeZone={timeZone}
                                        showTime
                                        showNow
                                        placeholder="Start"
                                        disabledDate={disabledDate}
                                        disabledTime={disabledTime}
                                    />
                                </FormikForm.Item>
                                <FormikForm.Item name={EFieldName.EndTime}>
                                    <FormikDatePicker
                                        {...createTestProps(ECalendarSelectors.EndDateInput)}
                                        className={cnDatePicker}
                                        name={EFieldName.EndTime}
                                        disabled={readonly}
                                        timeZone={timeZone}
                                        showTime
                                        showNow
                                        placeholder="End"
                                        disabledDate={disabledDate}
                                        disabledTime={disabledTime}
                                    />
                                </FormikForm.Item>
                            </div>
                        </FormikForm.Item>
                    </Space>
                </div>
                <FormikForm.Item
                    {...EAddTaskTabProps[EAddTaskTabSelectors.ConfigTemplateInput]}
                    className={cnConfigEditorFormItem}
                    name={EFieldName.BacktestingTemplate}
                >
                    <FormikConfigEditor
                        language={EConfigEditorLanguages.xml}
                        className={cn(cnConfigEditor, cnConfigWithoutResizer)}
                        name={EFieldName.BacktestingTemplate}
                        readOnly={readonly}
                    />
                </FormikForm.Item>
            </div>
        );
    },
);
