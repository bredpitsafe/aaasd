import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnTooltip = style(specify({ maxWidth: '400px' }));
export const cnStatus = style({ maxWidth: '400px', wordBreak: 'break-word' });
export const cnStatusMessage = style(
    specify({
        marginTop: '4px',
        padding: '8px',
        borderRadius: '4px',
        background: 'white',
    }),
);
export const cnIcon = style({
    display: 'inline-block',
    position: 'relative',
    width: '18px',
    height: '18px',
    borderRadius: '50%',
    fontSize: '18px',
    verticalAlign: 'sub',
});
