import { Col, Row } from '../Grid';
import type { SwitchProps } from '../Switch';
import { Switch } from '../Switch';
import { cnButtonPosition, cnLabel } from './components/view.css';

type TSettingsSwitchProps = SwitchProps & {
    label: string;
};
export const SettingsSwitch = (props: TSettingsSwitchProps) => {
    return (
        <Row gutter={[8, 16]}>
            <Col className={cnLabel} span={20}>
                {props.label}
            </Col>
            <Col flex="auto" className={cnButtonPosition}>
                <Switch size="small" {...props} />
            </Col>
        </Row>
    );
};
