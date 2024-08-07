import { LineOutlined, MenuOutlined } from '@ant-design/icons';
import {
    AddComponentTabProps,
    EAddComponentTabSelectors,
} from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-component-tab/add-component.tab.selector';
import { Button } from '@frontend/common/src/components/Button';
import { Editor } from '@frontend/common/src/components/Editors/Editor';
import { EConfigEditorLanguages } from '@frontend/common/src/components/Editors/types';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm, FormikInput } from '@frontend/common/src/components/Formik';
import { FormikInputFactory } from '@frontend/common/src/components/Formik/components/FormikInputFactory';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { Col, Row } from '@frontend/common/src/components/Grid';
import { Switch } from '@frontend/common/src/components/Switch';
import { EComponentConfigType } from '@frontend/common/src/types/domain/component';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { Formik } from 'formik';
import type { ReactElement } from 'react';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';

import { EGateType, GateKindSelector } from '../../../../widgets/GateKindSelector';
import type { TConnectedCreateComponentProps } from './index';
import {
    cnButtonContainer,
    cnEditor,
    cnEditorContainer,
    cnFields,
    cnForm,
    cnKindSwitch,
    cnRoot,
} from './view.css';
type TCreateComponentProps = TConnectedCreateComponentProps & {
    onSubmit: (values: CreateComponentFormValues) => void;
};

export type CreateComponentFormValues = {
    configType: EComponentConfigType;
    name: string;
    kind: string;
    config: string;
};

const FormikGateKindSelector = FormikInputFactory(GateKindSelector);

const Schema = Yup.object().shape({
    configType: Yup.string().required().oneOf(Object.values(EComponentConfigType)),
    name: Yup.string().required(),
    kind: Yup.string().required(),
    config: Yup.string().required(),
});

const INITIAL_VALUES = {
    configType: EComponentConfigType.robot,
    name: '',
    kind: '',
    config: '',
};

export function CreateComponent(props: TCreateComponentProps): ReactElement {
    return (
        <div className={cnRoot}>
            <Formik<CreateComponentFormValues>
                initialValues={INITIAL_VALUES}
                validationSchema={Schema}
                onSubmit={props.onSubmit}
            >
                {(formik) => <CreateComponentRenderer formik={formik} {...props} />}
            </Formik>
        </div>
    );
}

type TCreateComponentRendererProps = TWithFormik<CreateComponentFormValues> & TCreateComponentProps;
function CreateComponentRenderer(props: TCreateComponentRendererProps): ReactElement | null {
    const [isCustomKind, setIsCustomKind] = useState(false);

    const { values, setFieldValue, isValid } = props.formik;
    const { configType } = values;

    const cbChangeEditorValue = useFunction((value: string) => setFieldValue('config', value));
    // Upon receiving new configType from the parent we should update field value
    useEffect(() => {
        if (props.configType !== configType) {
            setFieldValue('configType', props.configType);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.configType]);

    // Reset custom kind when switching between configTypes.
    useEffect(() => {
        // Robots don't have predefined kind list and always use custom kind.
        setIsCustomKind(configType === EComponentConfigType.robot);
    }, [configType]);

    // Reset kind value when disabling custom kind switch
    useEffect(() => {
        if (!isCustomKind) {
            setFieldValue('kind', '');
        }
    }, [isCustomKind, setFieldValue]);

    return (
        <FormikForm
            {...AddComponentTabProps[EAddComponentTabSelectors.AddComponentTab]}
            layout="vertical"
            className={cnForm}
        >
            <Row gutter={8} className={cnFields}>
                <Col span={8}>
                    <FormikForm.Item name="name" label="Name">
                        <FormikInput
                            {...AddComponentTabProps[EAddComponentTabSelectors.NameInput]}
                            placeholder="Name"
                            name="name"
                            autoFocus
                        />
                    </FormikForm.Item>
                </Col>
                <Col span={8}>
                    <FormikForm.Item name="configType" label="Type">
                        <FormikSelect
                            {...AddComponentTabProps[EAddComponentTabSelectors.TypeSelector]}
                            placeholder="Type"
                            name="configType"
                            showSearch
                        >
                            <FormikSelect.Option
                                key={EComponentConfigType.execGate}
                                value={EComponentConfigType.execGate}
                            >
                                {EComponentConfigType.execGate}
                            </FormikSelect.Option>
                            <FormikSelect.Option
                                key={EComponentConfigType.mdGate}
                                value={EComponentConfigType.mdGate}
                            >
                                {EComponentConfigType.mdGate}
                            </FormikSelect.Option>
                            <FormikSelect.Option
                                key={EComponentConfigType.robot}
                                value={EComponentConfigType.robot}
                            >
                                {EComponentConfigType.robot}
                            </FormikSelect.Option>
                        </FormikSelect>
                    </FormikForm.Item>
                </Col>
                <Col span={8}>
                    <FormikForm.Item
                        {...AddComponentTabProps[EAddComponentTabSelectors.KindForm]}
                        name="kind"
                        label={
                            <>
                                Kind
                                <Switch
                                    {...AddComponentTabProps[EAddComponentTabSelectors.KindSwitch]}
                                    className={cnKindSwitch}
                                    size="small"
                                    title={
                                        isCustomKind
                                            ? 'Turn off to select kind from the list'
                                            : 'Turn on to input custom kind'
                                    }
                                    checkedChildren={<LineOutlined />}
                                    unCheckedChildren={<MenuOutlined />}
                                    checked={isCustomKind}
                                    disabled={configType === EComponentConfigType.robot}
                                    onChange={setIsCustomKind}
                                />
                            </>
                        }
                    >
                        {isCustomKind ? (
                            <FormikInput
                                {...AddComponentTabProps[EAddComponentTabSelectors.KindInput]}
                                placeholder="Kind"
                                name="kind"
                            />
                        ) : configType === EComponentConfigType.execGate ? (
                            <FormikGateKindSelector
                                {...AddComponentTabProps[EAddComponentTabSelectors.KindSelector]}
                                key={EGateType.execGate}
                                name="kind"
                                size="middle"
                                gateType={EGateType.execGate}
                            />
                        ) : configType === EComponentConfigType.mdGate ? (
                            <FormikGateKindSelector
                                key={EGateType.mdGate}
                                name="kind"
                                size="middle"
                                gateType={EGateType.mdGate}
                            />
                        ) : null}
                    </FormikForm.Item>
                </Col>
            </Row>
            <Row gutter={8} className={cnEditorContainer}>
                <Editor
                    className={cnEditor}
                    value={values.config}
                    language={EConfigEditorLanguages.xml}
                    onChangeValue={cbChangeEditorValue}
                />
            </Row>
            <Row gutter={8} className={cnButtonContainer}>
                <Button
                    {...AddComponentTabProps[EAddComponentTabSelectors.CreateButton]}
                    type="primary"
                    htmlType={'submit'}
                    disabled={!isValid}
                >
                    Create
                </Button>
            </Row>
        </FormikForm>
    );
}
