import { ForwardedRef, forwardRef, memo, ReactElement } from 'react';

import { green, red } from '../../../utils/colors';
export const NumberColorizerRenderer = memo(
    forwardRef(
        (
            props: {
                value: number;
                valueFormatted?: number | string | null;
            },
            ref: ForwardedRef<HTMLElement>,
        ): ReactElement => {
            let color = 'inherit';
            const { value, valueFormatted } = props;

            if (value < 0) {
                color = red[6];
            } else if (value > 0) {
                color = green[6];
            }

            return (
                <span ref={ref} style={{ color }}>
                    {valueFormatted}
                </span>
            );
        },
    ),
);
