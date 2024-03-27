import {
    styleFormInputAffixWrapper,
    styleFormItem,
    styleFormItemControlInput,
    styleFormItemControlInputContent,
    styleFormItemRow,
    styleFormNumberItem,
} from '@frontend/common/src/components/Form.css';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnRoot = style({
    display: 'flex',
    flexFlow: 'column nowrap',
    alignContent: 'stretch',
    gap: '8px',
    padding: '8px',
    height: '100%',
});

styleFormItem(cnRoot, {
    marginBottom: '12px',
});

styleFormNumberItem(cnRoot, {
    width: '100%',
});

export const cnInputField = style({
    flex: '0 0 auto',
});

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

export const cnInputFieldAction = style({
    flex: '0 0 auto',
});

export const cnActionButton = style({
    flex: '0 0 150px',
});

styleFormItemControlInputContent(cnInputFieldAction, {
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '8px',
});
