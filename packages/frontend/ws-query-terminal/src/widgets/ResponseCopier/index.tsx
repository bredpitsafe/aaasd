import { CopyOutlined } from '@ant-design/icons';
import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { isNil } from 'lodash-es';
import { memo } from 'react';

import { ModuleRequest } from '../../modules/request';
import { serializeQueryResult } from '../../utils';

type TProps = TWithClassname;

export const ResponseCopier = memo(({ className }: TProps) => {
    const { error } = useModule(ModuleNotifications);
    const { success } = useModule(ModuleMessages);
    const { getResult } = useModule(ModuleRequest);
    const result = useSyncObservable(getResult());
    async function copyToClipboard() {
        if (isNil(result?.value)) {
            error({ message: 'Error copying response' });
            return;
        }

        await clipboardWrite(serializeQueryResult(result.value));
        success('Response copied to clipboard');
    }

    return (
        <Button
            {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.ResponseCopyButton]}
            className={className}
            type="primary"
            onClick={copyToClipboard}
            icon={<CopyOutlined />}
            title="Copy response to clipboard"
            disabled={!isSyncedValueDescriptor(result)}
        >
            Copy
        </Button>
    );
});
