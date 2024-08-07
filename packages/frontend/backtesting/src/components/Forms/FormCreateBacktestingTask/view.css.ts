import {
    styleFormItem,
    styleFormItemLabelContainer,
    styleFormItemRow,
    styleVerticalFitFormItemContent,
} from '@frontend/common/src/components/Form.css';
import { styleTab, styleVerticalFitTabs } from '@frontend/common/src/components/Tabs.css';
import { red } from '@frontend/common/src/utils/colors';
import { cnRow } from '@frontend/common/src/utils/css/common.css';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnRoot = style({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});

styleFormItem(cnRoot, {
    marginBottom: '12px',
});

export const cnDatePicker = style({
    width: '200px',
});

export const cnTimes = style(
    cnRow,
    style({
        gap: '8px',
    }),
);

export const cnTabs = style({
    display: 'flex',
    flexGrow: 1,
    height: '100%',
});

styleTab(cnTabs, {
    padding: '4px 8px',
});

styleVerticalFitTabs(cnTabs);

export const cnTabNameWithError = style({
    color: red.primary,
});

export const cnInlineFormItem = style(
    specify({
        alignItems: 'center',
        flexDirection: 'row',
    }),
    style({
        gap: '8px',
        width: '100%',
    }),
);

styleFormItemLabelContainer(cnInlineFormItem, {
    paddingBottom: 0,
});

export const cnConfigEditorFormItem = style(specify({ margin: 0 }, 2), style({ height: '100%' }));

styleVerticalFitFormItemContent(cnConfigEditorFormItem);

export const cnConfigEditor = style({
    height: '100%',
});

export const cnConfigWithoutResizer = style({
    minHeight: '50px',
});
export const cnNameAndKind = style(
    cnRow,
    style({
        justifyContent: 'stretch',
        gap: '16px',
    }),
);

export const cnInput = style({
    flexGrow: 1,
});

export const cnUpdateButton = style({
    marginLeft: '10px',
});

styleFormItemRow(cnInput, {
    width: '100%',
});

export const cnServerSelectorContainer = style({
    marginLeft: '5px',
});
export const cnTemplateVariablesItem = style(specify({ margin: 0 }, 2), style({ height: '100%' }));

styleVerticalFitFormItemContent(cnTemplateVariablesItem);

export const cnScoreDateContainer = style({});

globalStyle(`${cnScoreDateContainer} .ant-space-item:first-child`, {
    flex: '1 0 400px',
});
