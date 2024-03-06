import { specify } from '@frontend/common/src/utils/css/specify';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnSaveAction = style(
    specify({
        flex: '0 0 auto',
    }),
);
export const cnIndicatorsInput = style({
    flex: '1 1 auto',
});

export const cnIndicatorsContainer = style({
    display: 'flex',
    width: '100%',
    alignItems: 'center',
});
