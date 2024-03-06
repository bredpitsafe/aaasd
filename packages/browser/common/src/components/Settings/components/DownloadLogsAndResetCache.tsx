import { isNil } from 'lodash-es';
import { memo } from 'react';

import { createTestProps } from '../../../../e2e';
import { EModalSelectors } from '../../../../e2e/selectors/modal.selectors';
import { WidgetResetAppButton } from '../../../widgets/WidgetResetAppButton';
import { Button } from '../../Button';
import { Col, Row } from '../../Grid';
import { Space } from '../../Space';
import { cnButtonPosition } from './view.css';

export type TDownloadLogsSettingsProps = {
    onDownloadLogs?: VoidFunction;
};

export const DownloadLogsAndResetCache = memo(({ onDownloadLogs }: TDownloadLogsSettingsProps) => {
    if (isNil(onDownloadLogs)) {
        return null;
    }

    return (
        <Row gutter={[8, 16]}>
            <Col flex="auto" offset={4} className={cnButtonPosition}>
                <Space>
                    <Button
                        {...createTestProps(EModalSelectors.DownloadLogsButton)}
                        onClick={onDownloadLogs}
                    >
                        Download logs
                    </Button>
                    <WidgetResetAppButton {...createTestProps(EModalSelectors.RestartAppButton)} />
                </Space>
            </Col>
        </Row>
    );
});
