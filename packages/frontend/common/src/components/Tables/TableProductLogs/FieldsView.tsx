import { SnippetsOutlined } from '@ant-design/icons';
import type { ReactElement } from 'react';

import { useModule } from '../../../di/react';
import { ModuleMessages } from '../../../lib/messages';
import { clipboardWrite } from '../../../utils/clipboard';
import { useFunction } from '../../../utils/React/useFunction';
import { Tooltip } from '../../Tooltip';
import { FieldView } from './FieldView';
import { cnTooltip, cnTooltipContainer } from './styles.css';

export function FieldsView(props: {
    data: {
        fields: Record<string, unknown>;
    };
}): ReactElement {
    const { success } = useModule(ModuleMessages);

    const renderTitle = useFunction(() => (
        <div className={cnTooltipContainer}>
            {Object.entries(props.data?.fields).map(([key, v]) => (
                <FieldView key={key} field={key} value={v} success={success} />
            ))}
        </div>
    ));

    const handleCopy = useFunction(() => {
        const title = JSON.stringify(props.data, undefined, 2);
        clipboardWrite(title).then(() => success(`Field data copied to clipboard`));
    });

    return (
        <Tooltip title={renderTitle} overlayClassName={cnTooltip} showArrow={false}>
            <SnippetsOutlined onClick={handleCopy} />
        </Tooltip>
    );
}
