import { CopyOutlined } from '@ant-design/icons';
import { Input } from '@frontend/common/src/components/Input';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import { TWithClassname } from '@frontend/common/src/types/components';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import { isEmpty, isObject, isString } from 'lodash-es';
import { memo } from 'react';

import { QueryResult } from '../../domain/QueryResult';
import { ModuleRequest } from '../../modules/request';

export const QueryResultTraceId = memo((props: TWithClassname) => {
    const { getResult } = useModule(ModuleRequest);
    const { error } = useModule(ModuleNotifications);
    const { success } = useModule(ModuleMessages);

    const result = useValueDescriptorObservableDeprecated(getResult());

    if (!isSyncDesc(result)) return null;
    const traceId = getTraceIdFromResult(result.value);
    if (!isString(traceId)) return null;

    async function copyToClipboard() {
        const traceId = isSyncDesc(result) ? getTraceIdFromResult(result.value) : null;
        if (!isString(traceId)) {
            error({ message: 'Error copying trace ID' });
            return;
        }

        await clipboardWrite(traceId);
        success('Trace ID copied to clipboard');
    }

    return (
        <Input
            className={props.className}
            addonBefore="Trace ID"
            addonAfter={<CopyOutlined onClick={copyToClipboard} />}
            value={traceId}
        />
    );
});

function getTraceIdFromResult(result: QueryResult): string | null {
    if (isEmpty(result)) return null;
    const message = result.at(-1);
    if (!isObject(message) || !('traceId' in message) || !isString(message.traceId)) return null;
    return message.traceId;
}
