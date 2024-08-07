import { useField } from 'formik';
import type { FunctionComponent } from 'react';

type InputLikeProps = { value: string; onChange: (v: string) => void };

export function FormikInputFactory<P extends object>(
    Input: FunctionComponent<P & InputLikeProps>,
): FunctionComponent<Omit<P & { name: string }, 'onChange' | 'value'>> {
    return function FormikInput(props) {
        const { name, ...inputProps } = props;
        const [{ value }, , { setValue }] = useField<string>(name);
        return <Input {...(inputProps as P)} value={value} onChange={setValue} />;
    };
}
