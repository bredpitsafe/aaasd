import { LoadingOutlined } from '@ant-design/icons';
import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Editor } from '@frontend/common/src/components/Editors/Editor';
import { EConfigEditorLanguages } from '@frontend/common/src/components/Editors/types';
import { Result } from '@frontend/common/src/components/Result';
import { Space } from '@frontend/common/src/components/Space';
import { Switch } from '@frontend/common/src/components/Switch';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable.ts';
import {
    isLoadingValueDescriptor,
    isSyncedValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo, useState } from 'react';

import { ERequestState, ModuleRequest } from '../../modules/request';
import { serializeQueryResult } from '../../utils';
import { QueryResultTraceId } from '../QueryResultTraceId';
import { ResponseCopier } from '../ResponseCopier';
import { cnActions, cnEditor, cnLoading, cnRoot } from './style.css';

const EMPTY_MESSAGE = {};

export const QueryResult = memo((props: TWithClassname) => {
    const { getResult, clearResult, getRequestState } = useModule(ModuleRequest);
    const [showAllMessages, setShowAllMessages] = useState(false);

    const result = useSyncObservable(getResult());
    const requestState = useSyncObservable(getRequestState());
    const inProgress =
        requestState === ERequestState.Receiving || requestState === ERequestState.Requesting;

    return (
        <div
            {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.ResponseTab]}
            className={cnRoot}
        >
            {isLoadingValueDescriptor(result) ? (
                <Result
                    className={cnLoading}
                    status="info"
                    title="Loading..."
                    icon={<LoadingOutlined />}
                />
            ) : (
                <>
                    <Editor
                        className={cn(cnEditor, props.className)}
                        language={EConfigEditorLanguages.json}
                        value={
                            isSyncedValueDescriptor(result)
                                ? serializeQueryResult(
                                      showAllMessages
                                          ? result.value
                                          : result.value.at(-1) ?? EMPTY_MESSAGE,
                                  )
                                : ''
                        }
                        readOnly
                    />
                    <Space className={cnActions}>
                        <ResponseCopier />
                        <Button
                            {...EWSQueryTerminalPageProps[
                                EWSQueryTerminalSelectors.ResponseClearButton
                            ]}
                            onClick={clearResult}
                            disabled={inProgress}
                        >
                            Clear
                        </Button>
                        {!isNil(result?.value?.at(-1)) ? (
                            <Switch
                                {...EWSQueryTerminalPageProps[
                                    EWSQueryTerminalSelectors.ResponseSwitch
                                ]}
                                checkedChildren="All"
                                unCheckedChildren="Last"
                                checked={showAllMessages}
                                onChange={setShowAllMessages}
                            />
                        ) : null}
                        <QueryResultTraceId />
                    </Space>
                </>
            )}
        </div>
    );
});
