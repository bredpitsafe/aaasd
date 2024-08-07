import { red } from '@ant-design/colors';
import { styleSelectSelector, styleSelectSuffix } from '@frontend/common/src/components/Select.css';
import { style } from '@frontend/common/src/utils/css/style.css';
import { globalStyle } from '@vanilla-extract/css';

export const cnCoinSelector = style({
    minWidth: '150px',
    flex: '1 0',
    height: '26px',
});

export const cnCoinSelectorEmpty = style({});

styleSelectSelector(cnCoinSelectorEmpty, {
    borderColor: red[3],
    backgroundColor: red[0],
});

styleSelectSuffix(cnCoinSelectorEmpty, {
    color: red[5],
});

globalStyle(`${cnCoinSelector} button`, {
    width: '100%',
    display: 'inline-flex',
    alignItems: 'center',
});

globalStyle(`${cnCoinSelector} button > :last-child`, {
    flex: '1 1 auto',
});
