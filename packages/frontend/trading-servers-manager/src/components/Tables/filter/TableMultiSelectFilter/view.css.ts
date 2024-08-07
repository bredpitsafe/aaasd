import { orange } from '@ant-design/colors';
import { specify } from '@frontend/common/src/utils/css/specify.ts';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnExistingOption = style(
    specify({
        fontWeight: 'bold',
    }),
);

export const cnSelectedOption = style(
    cnExistingOption,
    specify({
        fontStyle: 'italic',
    }),
);

export const cnSelectAllButton = style({
    width: '100%',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '4px 12px',
});

export const cnSelectContainer = style({
    position: 'relative',
});

export const cnWarnIcon = style({
    position: 'absolute',
    right: '26px',
    top: '6px',
    color: orange[5],
    fontSize: 'inherit',
});
