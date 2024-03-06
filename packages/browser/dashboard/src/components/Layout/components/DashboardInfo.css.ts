import { cnFit } from '@frontend/common/src/utils/css/common.css';
import { style } from '@vanilla-extract/css';

export const cnContainer = style([
    cnFit,
    {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#efefef',
    },
]);
