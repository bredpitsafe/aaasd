import cn from 'classnames';
import type { MouseEvent, ReactElement } from 'react';

import type { TWithTest } from '../../../../e2e';
import { pickTestProps } from '../../../../e2e';
import type { TWithClassname } from '../../../types/components';
import { useFunction } from '../../../utils/React/useFunction';
import { cnLink } from './UrlRenderer.css';

type TUrlRendererProps = TWithTest &
    TWithClassname & {
        url?: string;
        text?: string;
        onClick?: (url: string, name: string) => void;
    };

export function UrlRenderer(props: TUrlRendererProps): ReactElement | null {
    const cbClick = useFunction((event: MouseEvent) => {
        if (props.onClick === undefined || props.url === undefined || props.text === undefined) {
            return;
        }
        // If Ctrl or Meta keys are pressed, use link as usual.
        // If clicked without modifiers, use the listener to perform alt action.
        if (!event.ctrlKey && !event.metaKey) {
            event.preventDefault();
            props.onClick(props.url, props.text);
        }
    });

    if (props.text === undefined) {
        return null;
    }
    if (props.url === undefined) {
        return <>{props.text}</>;
    }

    return (
        <a
            className={cn(cnLink, props.className)}
            href={props.url}
            target="_blank"
            rel="noreferrer"
            onClick={cbClick}
            {...pickTestProps(props)}
        >
            {props.text}
        </a>
    );
}
