import 'flexlayout-react/style/underline.css';
import './index.css';

import type { ILayoutProps } from 'flexlayout-react';
import { Layout } from 'flexlayout-react';
import type { ForwardedRef, ReactElement } from 'react';
import { forwardRef } from 'react';

export const FlexLayout = forwardRef(
    (props: ILayoutProps, ref: ForwardedRef<Layout>): ReactElement => {
        return <Layout ref={ref} {...props} />;
    },
);
