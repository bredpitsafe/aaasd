import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { ReactElement } from 'react';

import { createTestProps } from '../../../e2e';
import { ETableTabFilterSelectors } from '../../../e2e/selectors/table-tab.filter.selectors';
import { Switch } from '../Switch';
import { TableLabel } from './TableLabel';
import { cnSwitch, cnTitle } from './TableLabelSwitch.css';

export type TTableLabelSwitchProps = {
    title?: string;
    enabled: boolean;
    onToggle: () => void;
};

export function TableLabelSwitch(props: TTableLabelSwitchProps): ReactElement {
    const title = props.title !== undefined ? props.title : 'Live';
    return (
        <TableLabel>
            <Switch
                {...createTestProps(ETableTabFilterSelectors.SwitchButton)}
                className={cnSwitch}
                size="small"
                title={title}
                checked={props.enabled}
                checkedChildren={<CheckOutlined />}
                unCheckedChildren={<CloseOutlined />}
                onChange={props.onToggle}
            />
            {title ? <span className={cnTitle}>{title}</span> : null}
        </TableLabel>
    );
}
