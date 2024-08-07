import type { Nil } from '@common/types';
import { isNil } from 'lodash-es';
import type { ForwardedRef, ReactElement } from 'react';
import { forwardRef, memo } from 'react';

import { green, red } from '../../../utils/colors';

export const NumberColorizerRenderer = memo(
    forwardRef(
        (
            props: {
                value: Nil | number;
                valueFormatted?: Nil | number | string;
            },
            ref: ForwardedRef<HTMLElement>,
        ): null | ReactElement => {
            if (isNil(props.value)) return null;

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
