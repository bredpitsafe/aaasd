import { memo } from 'react';

import { EModalProps, EModalSelectors } from '../../../e2e/selectors/modal.selectors';
import { Col, Row } from '../Grid';
import { Select, SelectProps } from '../Select';
import { cnLabel } from './components/view.css';

type TSliderSettingsProps = SelectProps & {
    label: string;
    labelSpan?: number;
};

export const SettingsSelector = memo(
    ({ labelSpan, label, ...selectProps }: TSliderSettingsProps) => {
        return (
            <Row gutter={[8, 16]}>
                <Col className={cnLabel} span={labelSpan ?? 6}>
                    {label}
                </Col>
                <Col flex="auto">
                    <Select
                        {...EModalProps[EModalSelectors.TabsCoinFilterInput]}
                        {...selectProps}
                    />
                </Col>
            </Row>
        );
    },
);
