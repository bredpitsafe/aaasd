import { globalStyle } from '@vanilla-extract/css';

import { style } from '../utils/css/style.css';

export const cnCard = style({});
globalStyle(`${cnCard} > .ant-card-body`, { padding: '8px' });

export const cnPicker = style({});
globalStyle(`${cnPicker}> .react-colorful__saturation`, { borderRadius: '4px 4px 0 0' });
globalStyle(`${cnPicker}> .react-colorful__hue`, { borderRadius: '0 0 4px 4px' });

export const cnInput = style({
    marginTop: '4px',
    width: '100%',
    background: '#eeeeee',
    borderRadius: '4px',
    border: 'none',
    outline: 'none',
    fontWeight: 'bold',
    textAlign: 'center',
});
