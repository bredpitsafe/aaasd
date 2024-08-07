import { PlusSquareOutlined } from '@ant-design/icons';
import {
    DashboardPageProps,
    EDashboardPageSelectors,
} from '@frontend/common/e2e/selectors/dashboard/dashboard.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Divider } from '@frontend/common/src/components/Divider';
import { FormikForm, FormikInput } from '@frontend/common/src/components/Formik';
import { List } from '@frontend/common/src/components/List';
import { Space } from '@frontend/common/src/components/Space';
import type { FormikHelpers } from 'formik';
import { Formik } from 'formik';
import { isEmpty, isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import * as Yup from 'yup';

import type { TFullDashboard } from '../../../types/fullDashboard';
import type { TGridLayout } from '../../../types/layout';
import { allDefaultLayouts } from '../../../utils/layout';
import { LayoutItem } from './LayoutItem';
import {
    cnContainer,
    cnDivider,
    cnLayoutAddContainer,
    cnLayoutAddInput,
} from './LayoutPopupContent.css';

type FormValues = {
    name: string;
};

export function LayoutPopupContent({
    fullDashboard,
    switchLayout,
    createLayout,
    deleteLayout,
    onSelectLayout,
}: {
    fullDashboard?: TFullDashboard;
    switchLayout?: (layoutName: string) => unknown;
    createLayout?: (layoutName: string) => void;
    deleteLayout?: (layoutName: string) => void;
    onSelectLayout?: (layout: TGridLayout) => void;
}): ReactElement {
    const layoutsList = useMemo(() => {
        if (isNil(fullDashboard)) {
            return undefined;
        }

        const layouts = Array.from(
            fullDashboard.dashboard.panels.reduce((set, { layouts }) => {
                layouts.forEach(({ name }) => {
                    if (isNil(name)) {
                        return;
                    }
                    set.add(name);
                });
                return set;
            }, new Set<string>()),
        ).sort();

        return layouts.length === 0 ? undefined : layouts;
    }, [fullDashboard]);

    const Schema = useMemo(() => {
        return Yup.object().shape({
            name: Yup.string()
                .max(20, 'Too Long name!')
                .notOneOf(layoutsList ?? [], 'This name already exists!'),
        });
    }, [layoutsList]);

    const gridLayouts = useMemo(
        () =>
            allDefaultLayouts.map((layout) => (
                <Button key={layout.name} type="default" onClick={() => onSelectLayout?.(layout)}>
                    {layout.name}
                </Button>
            )),
        [onSelectLayout],
    );

    const createComponent = useMemo(() => {
        if (isNil(createLayout)) {
            return null;
        }

        const cbSubmit = (
            values: FormValues,
            { setSubmitting, resetForm }: FormikHelpers<FormValues>,
        ) => {
            createLayout(values.name);
            setSubmitting(false);
            resetForm();
        };

        return (
            <Formik<FormValues>
                initialValues={{ name: '' }}
                validationSchema={Schema}
                onSubmit={cbSubmit}
            >
                {(formik) => (
                    <FormikForm className={cnLayoutAddContainer}>
                        <FormikForm.Item name="name" className={cnLayoutAddInput}>
                            <FormikInput
                                {...DashboardPageProps[EDashboardPageSelectors.LayoutNameInput]}
                                placeholder="Layout name"
                                name="name"
                            />
                        </FormikForm.Item>
                        <FormikForm.Item name="submit">
                            <Button
                                {...DashboardPageProps[EDashboardPageSelectors.AddLayoutNameButton]}
                                htmlType={'submit'}
                                icon={<PlusSquareOutlined />}
                                title="Add layout"
                                disabled={formik.isSubmitting || isEmpty(formik.values.name)}
                            />
                        </FormikForm.Item>
                    </FormikForm>
                )}
            </Formik>
        );
    }, [createLayout, Schema]);

    const layoutsListComponent = useMemo(() => {
        if (isNil(switchLayout) || isNil(layoutsList) || layoutsList.length === 0) {
            return null;
        }

        return (
            <List size="small">
                {layoutsList.map((name) => (
                    <LayoutItem
                        key={name}
                        active={fullDashboard?.dashboard.activeLayout ?? layoutsList[0]}
                        name={name}
                        switchLayout={switchLayout}
                        deleteLayout={deleteLayout}
                    />
                ))}
            </List>
        );
    }, [fullDashboard?.dashboard.activeLayout, layoutsList, switchLayout, deleteLayout]);

    return (
        <div className={cnContainer}>
            <Space wrap>{gridLayouts}</Space>
            {(createComponent || layoutsListComponent) && (
                <>
                    <Divider className={cnDivider} />
                    {createComponent}
                    {layoutsListComponent}
                </>
            )}
        </div>
    );
}
