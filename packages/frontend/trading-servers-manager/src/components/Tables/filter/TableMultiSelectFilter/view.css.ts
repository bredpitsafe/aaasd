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
