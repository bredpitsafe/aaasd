import type {
    TAmount,
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import * as Yup from 'yup';

import { commonValidationShape } from '../../components/utils';

export function useSchema(coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>) {
    return useMemo(
        () =>
            Yup.object().shape(
                {
                    ...commonValidationShape(coinInfo),

                    amountMin: Yup.number()
                        .min(0, 'Minimum amount is 0')
                        .when('amountMax', {
                            is: (amountMax: TAmount | undefined) => isNil(amountMax),
                            then: Yup.number().nullable().required('Min or Max value is required'),
                            otherwise: Yup.number().nullable().optional(),
                        }),
                    amountMax: Yup.number()
                        .min(0, 'Minimum amount is 0')
                        .when('amountMin', {
                            is: (amountMin: TAmount | undefined) => isNil(amountMin),
                            then: Yup.number().nullable().required('Min or Max value is required'),
                            otherwise: Yup.number()
                                .min(Yup.ref('amountMin'), 'Max should be greater then Min')
                                .nullable()
                                .optional(),
                        }),
                    amountCurrency: Yup.string().required('Required'),
                    rulePriority: Yup.number()
                        .nullable()
                        .required('Required')
                        .min(0, 'Minimum Rule Priority is 0')
                        .max(100, 'Maximum Rule Priority is 100'),
                    doNotOverride: Yup.boolean().required('Required'),
                },
                [['amountMin', 'amountMax']],
            ),
        [coinInfo],
    );
}
