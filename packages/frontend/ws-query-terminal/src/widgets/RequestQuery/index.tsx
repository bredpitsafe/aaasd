import {
    EWSQueryTerminalPageProps,
    EWSQueryTerminalSelectors,
} from '@frontend/common/e2e/selectors/ws-query-terminal/ws-query-terminal.page.selectors';
import { Editor } from '@frontend/common/src/components/Editors/Editor';
import { EConfigEditorLanguages } from '@frontend/common/src/components/Editors/types';
import { Space } from '@frontend/common/src/components/Space';
import { useModule } from '@frontend/common/src/di/react';
import type { TWithClassname } from '@frontend/common/src/types/components';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import cn from 'classnames';
import { memo } from 'react';

import { ModuleRequest } from '../../modules/request';
import { RequestQuerySaver } from '../RequestQuerySaver';
import { RequestRun } from '../RequestRun';
import { RequestStop } from '../RequestStop';
import { cnActions, cnEditor, cnQueryRow, cnRoot } from './style.css';

export const RequestQuery = memo((props: TWithClassname) => {
    const { getQuery, setQuery } = useModule(ModuleRequest);

    const request = useSyncObservable(getQuery());

    return (
        <div
            {...EWSQueryTerminalPageProps[EWSQueryTerminalSelectors.RequestTab]}
            className={cn(cnRoot, props.className)}
        >
            <div className={cnQueryRow}>
                <Editor
                    className={cnEditor}
                    language={EConfigEditorLanguages.json}
                    value={request ?? ''}
                    onChangeValue={setQuery}
                />
            </div>
            <Space className={cnActions}>
                <RequestRun size="middle" type="icon-label" />
                <RequestStop size="middle" type="icon-label" />
                <RequestQuerySaver />
            </Space>
        </div>
    );
});
