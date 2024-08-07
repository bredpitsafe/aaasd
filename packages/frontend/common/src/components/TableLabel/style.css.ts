import { style } from '@vanilla-extract/css';

import { hideInputEmptyAddon } from '../InputHelpers.css';
import { styleSelectSelector, styleSelectSuffix } from '../Select.css';

export const cnRegexpInput = style({
    fontSize: '14px',
});

hideInputEmptyAddon(cnRegexpInput);

export const cnTableLabelSelect = style({
    height: '22px',
    marginRight: '2px',
    width: '100%',
});

styleSelectSelector(cnTableLabelSelect, {
    color: '#0958d9',
    backgroundColor: '#e6f4ff',
    paddingRight: '40px',
    height: '26px',
});

styleSelectSuffix(cnTableLabelSelect, {
    color: 'rgb(9, 88, 217)',
});
