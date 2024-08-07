import { memo } from 'react';

import { Col, Row } from '../../Grid';
import { cnTroubleshootingContainer } from './view.css';

export const HelpLink = memo(() => (
    <Row gutter={[8, 16]}>
        <Col span={24} className={cnTroubleshootingContainer}>
            <a
                href="https://bhft-company.atlassian.net/wiki/spaces/PLAT/pages/18612262/UI+Troubleshooting"
                title="Documentation for UI Troubleshooting"
                target="_blank"
                rel="noreferrer"
            >
                UI Troubleshooting
            </a>
        </Col>
    </Row>
));
