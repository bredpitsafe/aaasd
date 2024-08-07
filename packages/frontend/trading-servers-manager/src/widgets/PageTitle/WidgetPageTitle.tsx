import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons';
import { Alert } from '@frontend/common/src/components/Alert';
import { Button } from '@frontend/common/src/components/Button';
import { ConnectedStageSwitch } from '@frontend/common/src/components/connectedComponents/ConnectedStageSwitch';
import { Space } from '@frontend/common/src/components/Space';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { ReactElement } from 'react';

import { useCompactComponentsMenu } from '../../components/Settings/hooks/useCompactComponentsMenu';
import { useTitle } from './hooks/useTitle';
import { cnComponentName, cnContainer, cnSpace, cnStageSwitch } from './WidgetPageTitle.css';

export function WidgetPageTitle(): ReactElement {
    const title = useTitle();
    const [compact, setCompact] = useCompactComponentsMenu();
    const cbToggleCompact = useFunction(() => setCompact(!compact));

    return (
        <div className={cnContainer}>
            <Space.Compact block className={cnSpace}>
                <Alert className={cnComponentName} type="info" message={title} />
                <Tooltip
                    title={compact ? 'Full components menu' : 'Compact components menu'}
                    placement="right"
                >
                    <Button
                        icon={compact ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                        onClick={cbToggleCompact}
                    />
                </Tooltip>
            </Space.Compact>
            <ConnectedStageSwitch className={cnStageSwitch} size="middle" type="icon-label" />
        </div>
    );
}
