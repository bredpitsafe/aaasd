import { useField } from 'formik';
import type { FormikFieldProps } from 'formik-antd/lib/FieldProps';
import { memo } from 'react';

import { useFunction } from '../../../utils/React/useFunction';
import type { SwitchProps } from '../../Switch';
import { Switch } from '../../Switch';

export const FormikSwitch = memo((props: Omit<SwitchProps, 'checked'> & FormikFieldProps) => {
    const { name, onChange, ...switchProps } = props;
    const [{ value }, , { setValue }] = useField<boolean>(name);

    const cbChange = useFunction((checked: boolean, event) => {
        setValue(checked);
        onChange?.(checked, event);
    });

    return <Switch {...switchProps} checked={value} onChange={cbChange} />;
});
