import type { TimeZone } from '@common/types';
import { Button } from 'antd';
import cn from 'classnames';
import { Formik } from 'formik';
import { isArray, mapValues } from 'lodash-es';
import { memo } from 'react';
import * as Yup from 'yup';

import { createTestProps } from '../../../../e2e';
import { EProductLogsTabSelectors } from '../../../../e2e/selectors/trading-servers-manager/components/product-logs-tab/product-logs.tab.selectors';
import type { TProductLogSubscriptionFilters } from '../../../modules/actions/productLogs/defs.ts';
import {
    allProductLogLevels,
    EProductLogLevel,
} from '../../../modules/actions/productLogs/defs.ts';
import { EMPTY_OBJECT } from '../../../utils/const';
import { useFunction } from '../../../utils/React/useFunction';
import { FormikForm } from '../../Formik';
import { FormikDatePicker } from '../../Formik/components/FormikDataPicker';
import { FormikSelect } from '../../Formik/components/FormikSelect';
import { Title } from '../../Title';
import {
    cnCol50,
    cnCol100,
    cnExclude,
    cnFilters,
    cnForm,
    cnInclude,
    cnItem,
    cnLastItem,
    cnRow,
} from './FiltersView.css';

const includeSchema = Yup.object().shape({
    level: Yup.array(Yup.string().oneOf(allProductLogLevels)).optional(),
    message: Yup.array(Yup.string()).optional(),
    actorKey: Yup.array(Yup.string()).optional(),
    actorGroup: Yup.array(Yup.string()).optional(),
});
const validationSchema = Yup.object().shape({
    since: Yup.number().required(),
    till: Yup.number().nullable().optional(),
    include: includeSchema.optional(),
    exclude: includeSchema.optional(),
});

export type TFiltersViewProps = {
    query: undefined | Omit<TProductLogSubscriptionFilters, 'backtestingRunId'>;
    timeZone: TimeZone;
    onChange: (query: Omit<TProductLogSubscriptionFilters, 'backtestingRunId'>) => unknown;
};

const emptyArrToEmpty = (v: unknown[]) => (isArray(v) ? (v.length === 0 ? undefined : v) : v);

export const FiltersView = memo((props: TFiltersViewProps) => {
    const handleSubmit = useFunction((values: TProductLogSubscriptionFilters) => {
        props.onChange({
            ...values,
            include: mapValues(values.include, emptyArrToEmpty),
            exclude: mapValues(values.exclude, emptyArrToEmpty),
        });
    });

    return (
        <Formik<TProductLogSubscriptionFilters>
            initialValues={props.query ?? EMPTY_OBJECT}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
        >
            {(formik) => {
                return (
                    <FormikForm className={cnForm} layout="vertical" size="small">
                        <div className={cnRow}>
                            <FormikForm.Item className={cnLastItem} name="since" label="Since">
                                <FormikDatePicker
                                    {...createTestProps(EProductLogsTabSelectors.SinceButton)}
                                    name="since"
                                    timeZone={props.timeZone}
                                    showTime
                                    allowClear={false}
                                    size="small"
                                />
                            </FormikForm.Item>
                            <FormikForm.Item className={cnLastItem} name="till" label="Till">
                                <FormikDatePicker
                                    {...createTestProps(EProductLogsTabSelectors.TillButton)}
                                    name="till"
                                    timeZone={props.timeZone}
                                    showTime
                                    size="small"
                                />
                            </FormikForm.Item>
                        </div>
                        <div className={cnRow}>
                            <FormikForm.Item
                                className={cnCol100}
                                style={{ marginBottom: 8 }}
                                name="include.level"
                                label="Level"
                            >
                                <FormikSelect
                                    {...createTestProps(EProductLogsTabSelectors.LevelSelector)}
                                    name="include.level"
                                    mode="multiple"
                                >
                                    {PRODUCT_LEVEL_OPTIONS}
                                </FormikSelect>
                            </FormikForm.Item>
                        </div>
                        <div className={cnRow}>
                            <div className={cn(cnCol50, cnInclude, cnFilters)}>
                                <Title level={4}>Include</Title>
                                <FormikForm.Item
                                    className={cnItem}
                                    name="include.message"
                                    label="Message"
                                >
                                    <FormikSelect
                                        {...createTestProps(
                                            EProductLogsTabSelectors.IncludeMessageInput,
                                        )}
                                        name="include.message"
                                        mode="tags"
                                    ></FormikSelect>
                                </FormikForm.Item>
                                <FormikForm.Item
                                    className={cnItem}
                                    name="include.actorKey"
                                    label="Actor Key"
                                >
                                    <FormikSelect
                                        {...createTestProps(
                                            EProductLogsTabSelectors.IncludeActorKeyInput,
                                        )}
                                        name="include.actorKey"
                                        mode="tags"
                                    ></FormikSelect>
                                </FormikForm.Item>
                                <FormikForm.Item
                                    className={cnLastItem}
                                    name="include.actorGroup"
                                    label="Actor Group"
                                >
                                    <FormikSelect
                                        {...createTestProps(
                                            EProductLogsTabSelectors.IncludeActorGroupInput,
                                        )}
                                        name="include.actorGroup"
                                        mode="tags"
                                    ></FormikSelect>
                                </FormikForm.Item>
                            </div>
                            <div className={cn(cnCol50, cnExclude, cnFilters)}>
                                <Title level={4}>Exclude</Title>
                                <FormikForm.Item
                                    className={cnItem}
                                    name="exclude.message"
                                    label="Message"
                                >
                                    <FormikSelect
                                        {...createTestProps(
                                            EProductLogsTabSelectors.ExcludeMessageInput,
                                        )}
                                        name="exclude.message"
                                        mode="tags"
                                    ></FormikSelect>
                                </FormikForm.Item>
                                <FormikForm.Item
                                    className={cnItem}
                                    name="exclude.actorKey"
                                    label="Actor Key"
                                >
                                    <FormikSelect
                                        {...createTestProps(
                                            EProductLogsTabSelectors.ExcludeActorKeyInput,
                                        )}
                                        name="exclude.actorKey"
                                        mode="tags"
                                    ></FormikSelect>
                                </FormikForm.Item>
                                <FormikForm.Item
                                    className={cnLastItem}
                                    name="exclude.actorGroup"
                                    label="Actor Group"
                                >
                                    <FormikSelect
                                        {...createTestProps(
                                            EProductLogsTabSelectors.ExcludeActorGroupInput,
                                        )}
                                        name="exclude.actorGroup"
                                        mode="tags"
                                    ></FormikSelect>
                                </FormikForm.Item>
                            </div>
                        </div>
                        <div>
                            <Button
                                {...createTestProps(EProductLogsTabSelectors.ApplyButton)}
                                type="primary"
                                size="middle"
                                onClick={formik.submitForm}
                                disabled={!formik.isValid}
                            >
                                Apply
                            </Button>
                        </div>
                    </FormikForm>
                );
            }}
        </Formik>
    );
});

const PRODUCT_LEVEL_OPTIONS = [
    EProductLogLevel.Info,
    EProductLogLevel.Warn,
    EProductLogLevel.Error,
].map((level: EProductLogLevel) => (
    <FormikSelect.Option key={level} value={level}>
        {level}
    </FormikSelect.Option>
));
