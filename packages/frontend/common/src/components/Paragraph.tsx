import type { Seconds } from '@common/types';
import type { TooltipPlacement } from 'antd/es/tooltip';
import type { EllipsisConfig } from 'antd/lib/typography/Base';
import ParagraphComponent from 'antd/lib/typography/Paragraph';
import type { ComponentProps } from 'react';
import { memo } from 'react';
import { useToggle } from 'react-use';

import { Tooltip } from './Tooltip';

export const Paragraph = ParagraphComponent;
export type ParagraphProps = ComponentProps<typeof Paragraph>;

export const TooltipParagraph = memo(
    ({
        children,
        ellipsis,
        placement,
        mouseEnterDelay,
        overlayClassName,
        ...props
    }: Omit<ParagraphProps, 'ellipsis'> & {
        ellipsis?: EllipsisConfig;
        placement?: TooltipPlacement;
        mouseEnterDelay?: Seconds;
        overlayClassName?: string;
    }) => {
        const [truncated, setTruncated] = useToggle(false);

        return (
            <Tooltip
                title={truncated ? children : undefined}
                placement={placement}
                mouseEnterDelay={mouseEnterDelay}
                overlayClassName={overlayClassName}
            >
                <Paragraph {...props} ellipsis={{ ...ellipsis, onEllipsis: setTruncated }}>
                    {/* NOTE: Fragment is necessary to avoid showing the title */}
                    <>{children}</>
                </Paragraph>
            </Tooltip>
        );
    },
);
