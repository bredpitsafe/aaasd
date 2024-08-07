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

export const cnInputField = style({
    flex: '1 0 30%',
    minWidth: '200px',
});

export const cnFlexWrap = style({
    flexBasis: '100%',
});

styleFormItem(cnRoot, {
    marginBottom: '12px',
});
styleFormNumberItem(cnRoot, {
    width: '100%',
});

export const cnContainer = style({
    containerType: 'inline-size',
    width: '100%',
    height: '100%',
    overflow: 'auto',
});

styleFormItem(cnContainer, {
    marginBottom: 0,
});

styleFormNumberItem(cnContainer, {
    width: '100%',
});

export const cnLabelNoVerticalSpace = style({
    display: 'flex',
    flexFlow: 'row nowrap',
    height: '32px',
    gap: '8px',
    alignItems: 'center',
});

export const cnNoWrapText = style({
    whiteSpace: 'nowrap',
});

export const cnActionsContainer = style({
    display: 'flex',
    flexFlow: 'row wrap',
    justifyContent: 'flex-end',
    gap: '8px',
});

export const cnInputFieldAction = style({
    flex: '1 1 auto',
});

styleFormItemControlInputContent(cnInputFieldAction, {
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'wrap',
    justifyContent: 'flex-end',
    gap: '8px',
});

export const cnActionButton = style({
    flex: '0 0 150px',
});

export const cnFullWidthGridRow = style({
    gridColumn: '1 / -1',
});

export const cnPercentageInput = style({});

styleInputPlaceHolder(cnPercentageInput, {
    color: '#595959',
});

export const cnWarnColorIcon = style({
    color: orange[3],
});
