import { ReactElement } from 'react';

import { ConnectedLayout } from './components/ConnectedLayout';
import { cnContent, cnRoot } from './view.css';

export function Page(): ReactElement {
    return (
        <div className={cnRoot}>
            <ConnectedLayout className={cnContent} />
        </div>
    );
}
