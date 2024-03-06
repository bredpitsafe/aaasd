import { EditOutlined, TableOutlined } from '@ant-design/icons';
import { Alert } from '@frontend/common/src/components/Alert';
import { ConnectedCustomViewGrid } from '@frontend/common/src/components/CustomView/ConnectedCustomViewGrid';
import { ConnectedCustomViewTable } from '@frontend/common/src/components/CustomView/ConnectedCustomViewTable';
import { ConfigFullEditor } from '@frontend/common/src/components/Editors/ConfigFullEditor';
import { useTabEditorState } from '@frontend/common/src/components/Editors/hooks/useTabEditorState';
import { EConfigEditorLanguages } from '@frontend/common/src/components/Editors/types';
import { Tabs, TabsProps } from '@frontend/common/src/components/Tabs';
import type { TScrollData } from '@frontend/common/src/types/componentMetadata';
import { EComponentType } from '@frontend/common/src/types/domain/component';
import type { TGate } from '@frontend/common/src/types/domain/gates';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { EApplicationOwner } from '@frontend/common/src/utils/CustomView/defs';
import { isCustomViewGrid, isCustomViewTable } from '@frontend/common/src/utils/CustomView/parse';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isEmpty, isNil } from 'lodash-es';
import { memo, ReactNode } from 'react';

import { ETabName } from '../PageComponent/PageComponent';
import { cnTab, cnTabPane, cnTabsContainer } from './CustomIndicators.css';
import { useCompiledTable, useCustomIndicatorConfigDB } from './hooks';

export interface ICustomIndicatorsCommonProps {
    socketName: string;
    socketUrl: TSocketURL;
    draft?: string | undefined;
    setDraft?: (value?: string) => void;
    getScrollPosition?: () => TScrollData | undefined;
    onSetScrollPosition?: (scroll?: TScrollData) => void;
}

interface ICustomIndicatorsRobotProps {
    robot: TRobot;
}

interface ICustomIndicatorsGateProps {
    gate: TGate;
}

export type TCustomIndicatorsProps = ICustomIndicatorsCommonProps &
    (ICustomIndicatorsRobotProps | ICustomIndicatorsGateProps);

function isGateProps(
    props: TCustomIndicatorsProps,
): props is ICustomIndicatorsGateProps & ICustomIndicatorsCommonProps {
    return 'gate' in props;
}

export const CustomIndicators = memo((props: TCustomIndicatorsProps) => {
    const type = isGateProps(props) ? props.gate.type : EComponentType.robot;
    const id = isGateProps(props) ? props.gate.id : props.robot.id;

    const [isInitialized, config, setConfig] = useCustomIndicatorConfigDB(
        props.socketName,
        type,
        id,
    );

    const handleApply = useFunction((value: string) => {
        setConfig(value).then(() => props.setDraft?.(undefined));
    });

    const handleChange = useFunction((value: string) => {
        props.setDraft?.(value === config ? undefined : value);
    });

    const handleDiscard = useFunction(() => {
        props.setDraft?.(undefined);
    });

    const { modifiedValue, changeValue, viewMode, changeViewMode } = useTabEditorState({
        key: id,
        modifiedValue: props.draft,
        onChangeValue: handleChange,
    });

    const { result, error } = useCompiledTable(config, props.socketUrl);

    if (!isInitialized) {
        return null;
    }

    let children: ReactNode = null;
    if (!isNil(error)) {
        children = (
            <Alert
                message={error.title}
                description={error.message}
                type={error.type}
                closable={false}
            />
        );
    } else if (isNil(result)) {
        children = (
            <Alert
                message="Failed to compile"
                description="Failed to parse custom view configuration"
                type="error"
                closable={false}
            />
        );
    } else if (isCustomViewTable(result)) {
        children = (
            <ConnectedCustomViewTable
                owner={EApplicationOwner.TSM}
                table={result.table}
                url={props.socketUrl}
            />
        );
    } else if (isCustomViewGrid(result)) {
        children = (
            <ConnectedCustomViewGrid
                owner={EApplicationOwner.TSM}
                grid={result.grid}
                url={props.socketUrl}
            />
        );
    }

    const items: TabsProps['items'] = [
        {
            key: ETabName.customView,
            label: <TableOutlined />,
            className: cnTabPane,
            children,
        },
        {
            key: ETabName.config,
            label: <EditOutlined />,
            className: cnTabPane,
            children: (
                <ConfigFullEditor
                    key={id}
                    className={cnTab}
                    value={config}
                    modifiedValue={modifiedValue}
                    onChangeValue={changeValue}
                    language={EConfigEditorLanguages.xml}
                    viewMode={viewMode}
                    onChangeViewMode={changeViewMode}
                    onApply={handleApply}
                    onDiscard={handleDiscard}
                    getScrollPosition={props.getScrollPosition}
                    onSetScrollPosition={props.onSetScrollPosition}
                    originalTitle="Saved config"
                    modifiedTitle="Edited config"
                />
            ),
        },
    ];

    return (
        <Tabs
            className={cnTabsContainer}
            size="small"
            tabPosition="left"
            defaultActiveKey={isEmpty(config) ? ETabName.config : ETabName.customView}
            items={items}
        />
    );
});
