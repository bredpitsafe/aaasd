import { Col, Row } from '@frontend/common/src/components/Grid.tsx';
import { cnLabel } from '@frontend/common/src/components/Settings/components/view.css.ts';

import { WidgetExcludedStrategies } from '../../../widgets/ExcludedStrategies.tsx';
import { cnSelect } from './ExcludedStrategies.css.ts';

export const ExcludedStrategies = () => {
    return (
        <Row gutter={[8, 16]}>
            <Col className={cnLabel} span={8}>
                Excluded Strategies
            </Col>
            <Col flex="auto">
                <WidgetExcludedStrategies className={cnSelect} />
            </Col>
        </Row>
    );
};
