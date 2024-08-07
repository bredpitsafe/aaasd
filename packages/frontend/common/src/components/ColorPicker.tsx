import cn from 'classnames';
import type { ReactElement } from 'react';
import { HexColorInput, HexColorPicker } from 'react-colorful';
import type { ColorPickerBaseProps } from 'react-colorful/dist/types';

import { Card } from './Card';
import { cnCard, cnInput, cnPicker } from './ColorPicker.css';

export { HexColorInput, HexColorPicker };

export function ColorPicker({
    className,
    ...props
}: Partial<ColorPickerBaseProps<string>>): ReactElement {
    return (
        <Card className={cn(className, cnCard)}>
            <HexColorPicker {...props} className={cnPicker} />
            <HexColorInput {...props} className={cnInput} prefixed />
        </Card>
    );
}
