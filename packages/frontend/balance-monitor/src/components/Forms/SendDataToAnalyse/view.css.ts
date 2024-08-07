import {
    styleFormInputAffixWrapper,
    styleFormItemControlInput,
    styleFormItemControlInputContent,
    styleFormItemRow,
} from '@frontend/common/src/components/Form.css';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnTextAreaField = style({
    flex: '1 1 100%',
    display: 'flex',
});

styleFormItemRow(cnTextAreaField, {
    height: '100%',
    flexGrow: 1,
});

styleFormItemControlInput(cnTextAreaField, {
    height: '100%',
});

styleFormItemControlInputContent(cnTextAreaField, {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
});

styleFormInputAffixWrapper(cnTextAreaField, {
    flex: '1 1 auto',
});

globalStyle(`${cnTextAreaField} textarea`, {
    resize: 'none',
    minHeight: 0,
});
