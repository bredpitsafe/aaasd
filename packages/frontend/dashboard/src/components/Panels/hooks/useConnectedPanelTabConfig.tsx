import { AlignLeftOutlined } from '@ant-design/icons';
import { generateTraceId } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import { useTabEditorState } from '@frontend/common/src/components/Editors/hooks/useTabEditorState';
import {
    EConfigEditorLanguages,
    EConfigEditorSchema,
} from '@frontend/common/src/components/Editors/types';
import { Suspense } from '@frontend/common/src/components/Suspense';
import { useModule } from '@frontend/common/src/di/react';
import { fromErrorToInfo } from '@frontend/common/src/utils/observability';
import { useNotifiedObservableFunction } from '@frontend/common/src/utils/React/useObservableFunction';
import {
    mapValueDescriptor,
    switchMapValueDescriptor,
} from '@frontend/common/src/utils/Rx/ValueDescriptor2';
import { createSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils';
import { noop } from 'lodash-es';
import { useMemo } from 'react';
import { lazily } from 'react-lazily';
import { from, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';

import { ModuleUpdatePanel } from '../../../modules/actions/dashboards/updatePanel';
import { ModuleCustomView } from '../../../modules/customView/module';
import type { TPanel, TPanelXMLConfigWithoutLayout } from '../../../types/panel';
import {
    isChartPanel,
    isCustomViewGridPanel,
    isCustomViewTablePanel,
} from '../../../types/panel/guards';
import {
    convertPanelToEditConfigPanelXml,
    convertPanelToExportablePanelEditorSimplified,
    convertXMLToPanel,
} from '../../../utils/panels/converters';
import { ConvertError } from '../../../utils/panels/errors';
import { useEditorCompletionSchema } from '../../hooks/useEditorCompletionSchema';
import type { TPanelTab } from '../../Panel/view';
import { cnConfigEditor } from './useConnectedPanelTabConfig.css';

const { ConfigFullEditor } = lazily(
    () => import('@frontend/common/src/components/Editors/ConfigFullEditor'),
);

export function useConnectedPanelTabConfig(panel: TPanel): TPanelTab | undefined {
    const { getCustomViewGrid, getCustomViewTable } = useModule(ModuleCustomView);
    const updatePanel = useModule(ModuleUpdatePanel);

    const { viewMode, changeViewMode } = useTabEditorState({
        key: panel.panelId,
    });

    const [changeConfig] = useNotifiedObservableFunction(
        (source: string) => {
            return from(convertXMLToPanel(source as TPanelXMLConfigWithoutLayout)).pipe(
                switchMap((panelContent) => {
                    const newPanel: TPanel = { ...panel, ...panelContent, panelId: panel.panelId };

                    if (isChartPanel(newPanel)) {
                        return of(createSyncedValueDescriptor(newPanel));
                    }
                    if (isCustomViewGridPanel(newPanel)) {
                        return getCustomViewGrid(newPanel.grid, newPanel.settings).pipe(
                            mapValueDescriptor(() => createSyncedValueDescriptor(newPanel)),
                        );
                    }
                    if (isCustomViewTablePanel(newPanel)) {
                        return getCustomViewTable(newPanel.table, newPanel.settings).pipe(
                            mapValueDescriptor(() => createSyncedValueDescriptor(newPanel)),
                        );
                    }

                    assertNever(newPanel);
                }),
                switchMapValueDescriptor(({ value: newPanel }) => {
                    return updatePanel(newPanel, { traceId: generateTraceId() });
                }),
            );
        },
        {
            mapError: (error: Error) =>
                error instanceof ConvertError ? error.toNotification() : fromErrorToInfo(error),
        },
    );

    const config = useMemo(
        () =>
            convertPanelToEditConfigPanelXml(convertPanelToExportablePanelEditorSimplified(panel)),
        [panel],
    );

    const { value: schema } = useEditorCompletionSchema(EConfigEditorSchema.panel);

    return {
        name: 'Config',
        icon: <AlignLeftOutlined />,
        child: (
            <Suspense>
                <ConfigFullEditor
                    key={panel.panelId}
                    className={cnConfigEditor}
                    language={EConfigEditorLanguages.xml}
                    schema={schema}
                    value={config}
                    viewMode={viewMode}
                    onChangeViewMode={changeViewMode}
                    onApply={changeConfig}
                    onDiscard={noop}
                    originalTitle="Saved panel config"
                    modifiedTitle="Edited panel config"
                />
            </Suspense>
        ),
    };
}
