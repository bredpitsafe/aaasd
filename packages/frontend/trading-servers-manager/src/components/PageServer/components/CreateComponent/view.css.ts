import { createFormItemStyle } from '@frontend/common/src/components/Form';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    width: '100%',
    height: '100%',
    padding: '10px',
});
export const cnForm = style({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});
createFormItemStyle(cnForm, { marginBottom: '12px' });

export const cnFields = style({
    flex: '0 0 auto',
});
export const cnEditorContainer = style({
    display: 'flex',
    height: '100%',
    flex: '1 1 auto',
});
export const cnButtonContainer = style({
    display: 'flex',
    flex: '0 0 auto',
    justifyContent: 'flex-end',
    marginTop: '10px',
});
export const cnEditor = style({
    border: '1px solid #d9d9d9',
    flexGrow: 1,
});
export const cnKindSwitch = style(
    specify({
        marginLeft: '5px',
    }),
);
