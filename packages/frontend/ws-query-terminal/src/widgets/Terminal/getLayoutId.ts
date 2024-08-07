import { isRunningInIframe } from '@frontend/common/src/utils/environment';

import { ELayoutIds } from '../../layouts';

export function getLayoutId(): ELayoutIds | undefined {
    return isRunningInIframe() ? ELayoutIds.TerminalEmbedded : ELayoutIds.Terminal;
}
