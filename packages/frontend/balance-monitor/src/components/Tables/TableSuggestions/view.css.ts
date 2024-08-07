import { blue, orange, red } from '@ant-design/colors';
import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnRowStyles = {
    suggests: style(
        specify({
            fontWeight: 'bold',
            backgroundColor: 'rgba(242, 210, 0, 0.486)',
        }),
    ),
    inProgress: style(
        specify({
            fontWeight: 'bold',
            backgroundColor: 'rgba(134, 235, 161, 0.483)',
        }),
    ),
    future: style(
        specify({
            fontWeight: 'bold',
            backgroundColor: 'rgba(97, 0, 242, 0.18)',
        }),
    ),
    xmaxbalance: style(
        specify({
            backgroundColor: 'rgba(0, 160, 24, 0.206)',
        }),
    ),
    amaxbalance: style(
        specify({
            backgroundColor: 'rgba(248, 169, 126, 0.133)',
        }),
    ),
};

export const cnActionButton = style({
    fontSize: '14px',
    height: '21px',
    padding: '0px 8px',
    borderRadius: '4px',
    lineHeight: '14px',
    width: '100%',
});

export const cnActionCellClass = style({
    padding: 0,
});

export const cnResetButton = style({
    height: '20px',
    width: '20px',
    padding: 0,
});

export const cnAccountItem = style({
    fontSize: '14px',
});

export const cnHighlightedAccount = style({
    fontWeight: 'bold',
});

export const cnSelectedAccount = style({
    fontStyle: 'italic',
    color: blue[8],
});

export const cnAmountIcon = style({
    marginRight: '8px',
});

export const cnWarnColorIcon = style({
    color: orange[6],
});

export const cnErrorColorIcon = style({
    color: red[6],
});
