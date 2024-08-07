import { Button } from '@frontend/common/src/components/Button';
import { Error } from '@frontend/common/src/components/Error/view';
import { Layout } from '@frontend/common/src/components/Layout';
import { LoadingOverlay } from '@frontend/common/src/components/overlays/LoadingOverlay';
import type { TWithChildren } from '@frontend/common/src/types/components';
import { Content, Header } from 'antd/es/layout/layout';
import type { ReactNode } from 'react';

import { cnLayout, cnLayoutContent, cnLayoutHeader, cnLayoutHeaderContent } from './PageLayout.css';

type TLayoutProps = TWithChildren & {
    title: string;
    error: string | undefined;
    loading?: boolean;
    headerExtra?: ReactNode | ReactNode[];
    onRetryLoadData: () => void;
};
export const PageLayout = (props: TLayoutProps) => {
    const { title, error, loading, onRetryLoadData, children, headerExtra } = props;

    let content: ReactNode = null;

    if (loading) {
        content = <LoadingOverlay text="Loading data..." />;
    } else if (error) {
        content = (
            <Error
                status={500}
                title={error}
                extra={<Button onClick={onRetryLoadData}>Retry</Button>}
            />
        );
    } else {
        content = <Content className={cnLayoutContent}>{children}</Content>;
    }

    return (
        <Layout className={cnLayout}>
            <Header className={cnLayoutHeader}>
                <div className={cnLayoutHeaderContent}>
                    <h1>{title}</h1>
                    {headerExtra}
                </div>
            </Header>
            {content}
        </Layout>
    );
};
