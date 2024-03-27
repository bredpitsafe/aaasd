import { CopyOutlined } from '@ant-design/icons';
import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { TWithClassname } from '@frontend/common/src/types/components';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { memo } from 'react';

import { serializeQueryResult } from '../../domain/QueryResult';
import { ModuleRequest } from '../../modules/request';

type TProps = TWithClassname;

export const ResponseCopier = memo(({ className }: TProps) => {
    const { error } = useModule(ModuleNotifications);
    const { success } = useModule(ModuleMessages);
    const { getResult } = useModule(ModuleRequest);
    const result = useValueDescriptorObservableDeprecated(getResult());
    async function copyToClipboard() {
        if (!isSyncDesc(result)) {
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
            disabled={!isSyncDesc(result)}
        >
            Copy
        </Button>
    );
});
