import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useMemo } from 'react';
import * as Yup from 'yup';

import { commonValidationShape } from '../../components/utils';

export function useSchema(coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>) {
    return useMemo(
        () =>
            Yup.object().shape({
                ...commonValidationShape(coinInfo),

                enableAuto: Yup.boolean().nullable().required('Required'),

                rulePriority: Yup.number()
                    .nullable()
                    .required('Required')
                    .min(0, 'Minimum Rule Priority is 0')
                    .max(100, 'Maximum Rule Priority is 100'),
            }),
        [coinInfo],
    );
}
