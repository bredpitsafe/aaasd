import { UnorderedListOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { Error } from '@frontend/common/src/components/Error/view';
import { Link } from '@frontend/common/src/components/Link';
import { Paragraph } from '@frontend/common/src/components/Paragraph';
import { isEmpty } from 'lodash-es';

import { useScopedDashboardsState } from '../../../modules/router/hooks/useScopedDashboardsRoute';
import { EDashboardRoutes } from '../../../types/router';

export function DashboardError({ title, description }: { title: string; description?: string }) {
    const { currentScope } = useScopedDashboardsState();

    return (
        <Error
            status="error"
            title={title}
            subTitle={isEmpty(description) ? undefined : <Paragraph>{description}</Paragraph>}
            extra={
                <Link routeName={EDashboardRoutes.Default} routeParams={{ scope: currentScope }}>
                    <Button type="primary">
                        <UnorderedListOutlined />
                        Return to list
                    </Button>
                </Link>
            }
        />
    );
}
