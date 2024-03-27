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
import { TWithClassname } from '@frontend/common/src/types/components';
import { useValueDescriptorObservableDeprecated } from '@frontend/common/src/utils/React/useValueDescriptorObservableDeprecated';
import { isSyncDesc, isUnscDesc } from '@frontend/common/src/utils/ValueDescriptor';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import { memo, useState } from 'react';

import { serializeQueryResult } from '../../domain/QueryResult';
import { ModuleRequest } from '../../modules/request';
import { QueryResultTraceId } from '../QueryResultTraceId';
import { ResponseCopier } from '../ResponseCopier';
import { cnActions, cnEditor, cnLoading, cnRoot } from './style.css';

const EMPTY_MESSAGE = {};

export const QueryResult = memo((props: TWithClassname) => {
    const { getResult, clearResult, getRequestState } = useModule(ModuleRequest);
    const [showAllMessages, setShowAllMessages] = useState(false);

    const result = useValueDescriptorObservableDeprecated(getResult());
    const requestState = useValueDescriptorObservableDeprecated(getRequestState());
    const inProgress = isSyncDesc(requestState) || isUnscDesc(requestState);

    return (
        <div
            {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.ResponseTab]}
            className={cnRoot}
        >
            {isSyncDesc(result) ? (
                <>
                    <Editor
                        className={cn(cnEditor, props.className)}
                        language={EConfigEditorLanguages.json}
                        value={serializeQueryResult(
                            showAllMessages ? result.value : result.value.at(-1) ?? EMPTY_MESSAGE,
                        )}
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
                        {!isNil(result.value.at(-1)) ? (
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
            ) : (
                <Result
                    className={cnLoading}
                    status="info"
                    title="Loading..."
                    icon={<LoadingOutlined />}
                />
            )}
        </div>
    );
});
