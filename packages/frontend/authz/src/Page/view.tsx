import {
    AuthzProps,
    EAuthzSelectors,
} from '@frontend/common/e2e/selectors/authz/authz.page.selectors';
import type { ReactElement } from 'react';

import { WidgetLayout } from '../widgets/WidgetLayout';
import { cnContent, cnRoot } from './view.css';

export function Page(): ReactElement {
    return (
        <div {...AuthzProps[EAuthzSelectors.App]} className={cnRoot}>
            <WidgetLayout className={cnContent} />
        </div>
    );
}
