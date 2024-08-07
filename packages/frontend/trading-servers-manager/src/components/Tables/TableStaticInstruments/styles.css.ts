import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnDynamicDataTooltip = style(
    specify({
        maxWidth: 'none',
    }),
);

export const cnDynamicDataTooltipTable = style(
    specify({
        width: 400,
    }),
);

globalStyle(`${cnDynamicDataTooltipTable} .ag-header`, {
    display: 'none',
});

globalStyle(`${cnDynamicDataTooltipTable} .ag-body`, {
    minHeight: 168,
});

export const cnLabelName = style({
    fontWeight: 'bold',
});
