import { createFormItemStyle } from '@frontend/common/src/components/Form';
import { styleFormItemLabel } from '@frontend/common/src/components/Form.css.ts';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnForm = style({ padding: '10px', width: '640px' });
createFormItemStyle(cnForm, { marginBottom: '12px' });

export const cnInstrumentGroupLabel = style({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
});

export const cnInstrumentGroup = style({});
styleFormItemLabel(cnInstrumentGroup, { width: '100%' });
