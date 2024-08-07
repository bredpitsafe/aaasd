import type { Properties } from 'csstype';
import type { ReactNode } from 'react';

export type TWithClassname = {
    className?: string;
};
export type TWithStyle = {
    style?: Properties;
};

export type TWithChild = {
    children?: ReactNode;
};

export type TWithChildren<T = ReactNode | ReactNode[]> = {
    children?: T;
};

export type TComponentProps = TWithClassname & TWithChildren;
