import { CloseOutlined, IssuesCloseOutlined } from '@ant-design/icons';

import { WidgetResetAppButton } from '../../widgets/WidgetResetAppButton';
import type { AlertProps } from '../Alert';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Space } from '../Space';
import { cnAlert } from './ConnectionAlert.css.ts';

type TConnectionAlertProps = {
    onClose: () => void;
    showResetCache?: boolean;
} & AlertProps;
export const ConnectionAlert = (props: TConnectionAlertProps) => {
    const { onClose, showResetCache = false, ...alertProps } = props;
    return (
        <Alert
            className={cnAlert}
            type="warning"
            showIcon
            {...alertProps}
            action={
                <Space direction="vertical" align="end">
                    <Button danger size="small" icon={<CloseOutlined />} onClick={onClose}>
                        Close
                    </Button>
                    {showResetCache && (
                        <WidgetResetAppButton
                            icon={<IssuesCloseOutlined />}
                            size="small"
                            type="primary"
                        />
                    )}
                </Space>
            }
        />
    );
};
