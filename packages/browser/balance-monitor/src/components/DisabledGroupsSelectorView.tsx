import { Tag } from '@frontend/common/src/components/Tag';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { assertNever } from '@frontend/common/src/utils/assert';
import { ForwardedRef, forwardRef, memo } from 'react';

export const DisabledGroupsSelectorView = memo(
    forwardRef(
        (
            {
                className,
                disabledGroups,
            }: TWithClassname & {
                disabledGroups: ERuleGroups;
            },
            ref: ForwardedRef<HTMLElement>,
        ) => {
            switch (disabledGroups) {
                case ERuleGroups.All:
                    return (
                        <Tag className={className} color="gold" ref={ref}>
                            Suggest + Manual
                        </Tag>
                    );
                case ERuleGroups.Suggest:
                    return (
                        <Tag className={className} color="green" ref={ref}>
                            Suggest
                        </Tag>
                    );
                case ERuleGroups.Manual:
                    return (
                        <Tag className={className} color="volcano" ref={ref}>
                            Manual
                        </Tag>
                    );
                case ERuleGroups.None:
                    return (
                        <Tag className={className} color="grey" ref={ref}>
                            None
                        </Tag>
                    );
                default:
                    assertNever(disabledGroups);
            }
        },
    ),
);
