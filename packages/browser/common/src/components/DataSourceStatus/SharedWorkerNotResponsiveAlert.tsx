import { CloseOutlined, IssuesCloseOutlined } from '@ant-design/icons';

import { WidgetResetAppButton } from '../../widgets/WidgetResetAppButton';
import { Alert } from '../Alert';
import { Button } from '../Button';
import { Space } from '../Space';
import { cnAlert } from './SharedWorkerNotResponsiveAlert.css';

type TSharedWorkerNotResponsiveAlertProps = {
    onClose: () => void;
};
export const SharedWorkerNotResponsiveAlert = (props: TSharedWorkerNotResponsiveAlertProps) => {
    return (
        <Alert
            className={cnAlert}
            message="Shared Worker has become unresponsive"
            description="Data may become stale. It is advised to reload the page"
            type="warning"
            showIcon
            action={
                <Space direction="vertical" align="end">
                    <Button danger size="small" icon={<CloseOutlined />} onClick={props.onClose}>
                        Close
                    </Button>
                    <WidgetResetAppButton
                        icon={<IssuesCloseOutlined />}
                        size="small"
                        type="primary"
                    />
                </Space>
            }
        />
    );
};
