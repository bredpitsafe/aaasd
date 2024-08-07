import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';

import { Nav } from '../../widgets/Nav';
import { Terminal } from '../../widgets/Terminal';
import { cnLayout, cnRoot } from './style.css';

export function Page() {
    return (
        <div {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.App]} className={cnRoot}>
            <Nav timeZoneIndicator={false} />
            <Terminal className={cnLayout} />
        </div>
    );
}
