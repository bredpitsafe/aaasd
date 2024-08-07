import { memo } from 'react';
import * as Yup from 'yup';

import {
    OrderBookTabProps,
    OrderBookTabSelectors,
} from '../../../../e2e/selectors/trading-servers-manager/components/order-book-tab/order-book.tab.selectors';
import { FormikForm, FormikInput } from '../../Formik';
import { styleDepthInput, styleDepthSelector } from './style.css';

const FIELD_NAME = 'depth';
export const DEPTH_SCHEMA = {
    [FIELD_NAME]: Yup.number().required(),
};

export type TDepth = {
    [FIELD_NAME]?: number;
};

export const DepthSelector = memo(() => (
    <FormikForm.Item className={styleDepthSelector} name={FIELD_NAME} label={'OrderBook depth'}>
        <FormikInput
            {...OrderBookTabProps[OrderBookTabSelectors.OrderBookDepthInput]}
            className={styleDepthInput}
            name={FIELD_NAME}
            type="number"
            step={1}
            min={1}
            max={999}
            maxLength={9}
            placeholder="Depth"
        />
    </FormikForm.Item>
));
