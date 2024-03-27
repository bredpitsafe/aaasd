import { globalStyle } from '@vanilla-extract/css';

import { specify } from '../../../utils/css/specify';
import { style } from '../../../utils/css/style.css';
import { styleSelectSelector } from '../../Select.css';

export const cnDefault = style({
    border: '1px solid #d9d9d9',
    borderRadius: '6px',
    overflow: 'hidden',
    ':hover': {
        borderColor: '#4096ff',
    },
    ':focus-within': {
        borderColor: '#4096ff',
    },
});

export const cnError = style(
    specify({
        borderColor: '#ff4d4f',
    }),
);

export const cnRadioSelectorGroup = style({
    display: 'flex',
    justifyItems: 'stretch',
});

globalStyle(`${cnRadioSelectorGroup} > label:not(#\\9)`, {
    height: 'unset',
    display: 'flex',
    alignItems: 'center',
});

export const cnRadioSelector = style({});

styleSelectSelector(cnRadioSelector, {
    borderLeft: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
});

export const cnRadioSelectorEnabled = style({
    ':before': {
        position: 'absolute',
        insetBlockStart: 0,
        insetInlineStart: '-1px',
        display: 'block',
        boxSizing: 'content-box',
        width: '1px',
        height: 'calc(100% - 2px)',
        paddingBlock: '1px',
        paddingInline: 0,
        backgroundColor: '#1677ff',
        transition: 'background-color .3s',
        content: '',
    },
});

styleSelectSelector(cnRadioSelectorEnabled, {
    borderColor: '#1677ff',
});

export const cnAddInstrumentAction = style({
    display: 'flex',
    flexDirection: 'column',
    marginTop: '8px',
});
