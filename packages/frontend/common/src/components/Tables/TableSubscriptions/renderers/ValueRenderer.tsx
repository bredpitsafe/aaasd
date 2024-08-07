import { EditOutlined, SnippetsOutlined } from '@ant-design/icons';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';

import { useModule } from '../../../../di/react.tsx';
import { ModuleMessages } from '../../../../modules/messages';
import { clipboardWrite } from '../../../../utils/clipboard.ts';
import { useFunction } from '../../../../utils/React/useFunction.ts';
import { Space } from '../../../Space.ts';
import { Tooltip } from '../../../Tooltip.tsx';
import { cnTooltip, cnTooltipContainer } from './ValueRenderer.css.ts';

export function ValueRenderer(props: {
    value: Record<string, unknown>;
    onOpenEditor: (content: string) => void;
}): ReactElement {
    const { success } = useModule(ModuleMessages);

    const cbGetStringValue = useFunction(() => JSON.stringify(props.value, undefined, 2));

    const renderTitle = useFunction(() => (
        <div className={cnTooltipContainer}>{cbGetStringValue()}</div>
    ));

    const handleCopy = useFunction(() => {
        clipboardWrite(cbGetStringValue()).then(() => success(`Field data copied to clipboard`));
    });

    const handleOpenEditor = useFunction(() => {
        props.onOpenEditor(cbGetStringValue());
    });

    if (isNil(props.value)) {
        return <>—</>;
    }

    return (
        <Space>
            <Tooltip title={renderTitle} overlayClassName={cnTooltip} showArrow={false}>
                <SnippetsOutlined onClick={handleCopy} />
            </Tooltip>
            <EditOutlined onClick={handleOpenEditor} />
        </Space>
    );
}
