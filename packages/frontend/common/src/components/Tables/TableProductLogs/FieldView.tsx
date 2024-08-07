import { CopyOutlined } from '@ant-design/icons';
import type { TypeOpen } from 'antd/es/message/interface';
import { isNil, isObject } from 'lodash-es';
import { memo, useMemo } from 'react';

import { clipboardWrite } from '../../../utils/clipboard';
import { useFunction } from '../../../utils/React/useFunction';
import { Paragraph } from '../../Paragraph';
import { cnFieldContainer, cnFieldLabel, cnFieldLabelIcon, cnFieldValue } from './styles.css';

const ELLIPSIS_SETTINGS = {
    rows: 2,
    expandable: true,
    symbol: 'More',
};

export const FieldView = memo(
    ({ field, value, success }: { field: string; value: unknown; success: TypeOpen }) => {
        const displayValue = useMemo(
            () => (isNil(value) || isObject(value) ? JSON.stringify(value) : String(value)),
            [value],
        );

        const handleCopy = useFunction(() => {
            clipboardWrite(displayValue).then(() =>
                success(`Field "${field}" data copied to clipboard`),
            );
        });

        return (
            <div className={cnFieldContainer} onClick={handleCopy}>
                <div className={cnFieldLabel}>
                    {field}
                    <CopyOutlined className={cnFieldLabelIcon} />
                </div>
                <Paragraph ellipsis={ELLIPSIS_SETTINGS} editable={false} className={cnFieldValue}>
                    {displayValue}
                </Paragraph>
            </div>
        );
    },
);
