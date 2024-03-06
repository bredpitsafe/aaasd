import 'flexlayout-react/style/underline.css';
import './index.css';

import { ILayoutProps, Layout } from 'flexlayout-react';
import { ForwardedRef, forwardRef, ReactElement } from 'react';

export const FlexLayout = forwardRef(
    (props: ILayoutProps, ref: ForwardedRef<Layout>): ReactElement => {
        return <Layout ref={ref} {...props} />;
    },
);
