import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnApproveStatusContainer = style({
    display: 'flex',
    flexFlow: 'row',
    flexWrap: 'nowrap',
    alignItems: 'center',
});

export const cnApproveStatusButton = style(
    specify({
        minWidth: 20,
        width: 20,
        height: 20,
        padding: 0,
        fontSize: 0,
    }),
);

export const cnApproveStatusButtonIcon = style({
    fontSize: '12px',
});
