import { CopyOutlined } from '@ant-design/icons';
import { Input } from '@frontend/common/src/components/Input';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import { ModuleNotifications } from '@frontend/common/src/modules/notifications/module';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { clipboardWrite } from '@frontend/common/src/utils/clipboard';
import { useValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import { isEmpty, isNil, isObject, isString } from 'lodash-es';
import { memo } from 'react';

import { ModuleRequest } from '../../modules/request';
import type { TQueryResult } from '../../types';

export const QueryResultTraceId = memo((props: TWithClassname) => {
    const { getResult } = useModule(ModuleRequest);
    const { error } = useModule(ModuleNotifications);
    const { success } = useModule(ModuleMessages);

    const result = useValueDescriptorObservable(getResult());

    if (isNil(result.value)) return null;

    const traceId = getTraceIdFromResult(result.value);

    if (!isString(traceId)) return null;

    async function copyToClipboard() {
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

function getTraceIdFromResult(result: TQueryResult): string | null {
    if (isEmpty(result)) return null;
    const message = result.at(-1);
    if (!isObject(message) || !('traceId' in message) || !isString(message.traceId)) return null;
    return message.traceId;
}
