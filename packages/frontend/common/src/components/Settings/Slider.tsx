import { ClearOutlined } from '@ant-design/icons';
import type { SliderRangeProps, SliderSingleProps } from 'antd/es/slider';

import { Button } from '../Button';
import { Col, Row } from '../Grid';
import { Slider } from '../Slider';
import { cnButtonPosition, cnLabel } from './components/view.css';

type TSliderSettingsProps = (SliderSingleProps | SliderRangeProps) & {
    label: string;
    onReset: VoidFunction;
};
export const SettingsSlider = (props: TSliderSettingsProps) => {
    return (
        <Row gutter={[8, 16]}>
            <Col className={cnLabel} span={6}>
                {props.label}
            </Col>
            <Col flex="auto">
                <Slider {...props} />
            </Col>
            <Col className={cnButtonPosition} span={2}>
                <Button size="small" type="text" icon={<ClearOutlined />} onClick={props.onReset} />
            </Col>
        </Row>
    );
};
