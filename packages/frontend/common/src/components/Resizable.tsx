import 'react-resizable/css/styles.css';

import PropTypes from 'prop-types';
import type { ReactElement, SyntheticEvent } from 'react';
import { useCallback, useState } from 'react';
import type { ResizableBoxProps as BaseBoxProps } from 'react-resizable';
import { Resizable, ResizableBox as BaseBox, ResizeCallbackData } from 'react-resizable';

(BaseBox as unknown as { propTypes: object }).propTypes = {
    ...(BaseBox as unknown as { propTypes: object }).propTypes,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

(Resizable as unknown as { propTypes: object }).propTypes = {
    ...(Resizable as unknown as { propTypes: object }).propTypes,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

export type ResizableBoxProps = Omit<BaseBoxProps, 'children' | 'width' | 'height'> & {
    width?: number;
    height?: number;
    children: ReactElement | ((props: { width: number; height: number }) => ReactElement);
};

export function ResizableBox(props: ResizableBoxProps): ReactElement {
    return typeof props.children === 'function' ? (
        <ResizableBoxAdvance {...(props as ResizableBoxAdvanceProps)} />
    ) : (
        <ResizableBoxSimple {...(props as ResizableBoxSimpleProps)} />
    );
}

type ResizableBoxSimpleProps = ResizableBoxProps & {
    children: ReactElement;
};
export function ResizableBoxSimple(
    props: ResizableBoxProps & {
        children: ReactElement;
    },
): ReactElement {
    return <BaseBox {...(props as BaseBoxProps)} />;
}

type ResizableBoxAdvanceProps = ResizableBoxProps & {
    children: (props: { width: number; height: number }) => ReactElement;
};
export function ResizableBoxAdvance(props: ResizableBoxAdvanceProps): ReactElement {
    const { children, onResize } = props;
    const [rect, setRect] = useState({
        width: 0,
        height: 0,
    });
    const cbResize: BaseBoxProps['onResize'] = useCallback(
        (e: SyntheticEvent, data: ResizeCallbackData) => {
            setRect(data.size);
            onResize?.(e, data);
        },
        [onResize],
    );

    return (
        <BaseBox {...(props as BaseBoxProps)} onResize={cbResize}>
            {typeof children === 'function' ? children(rect) : children}
        </BaseBox>
    );
}

export { ResizeCallbackData, Resizable };
