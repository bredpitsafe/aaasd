import { orange } from '@ant-design/colors';
import {
    styleFormItem,
    styleFormItemControlInputContent,
    styleFormNumberItem,
} from '@frontend/common/src/components/Form.css';
import { styleInputPlaceHolder } from '@frontend/common/src/components/InputHelpers.css';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRoot = style({
    display: 'flex',
    flexFlow: 'row wrap',
    alignContent: 'flex-start',
    gap: '8px',
    margin: '8px',
});

styleFormItem(cnRoot, {
    marginBottom: '12px',
});

export const cnInputField = style({
    flex: '1 0 30%',
    minWidth: '200px',
});

styleFormNumberItem(cnRoot, {
    width: '100%',
});

export const cnTransferExists = style({
    fontWeight: 'bold',
});

export const cnFlexWrap = style({
    flexBasis: '100%',
});

export const cnInputFieldAction = style({
    flex: '1 1 auto',
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

export const cnWarnColorIcon = style({
    color: orange[3],
});

export const cnPercentageInput = style({});

styleInputPlaceHolder(cnPercentageInput, {
    color: '#595959',
});
