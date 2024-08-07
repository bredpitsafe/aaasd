import type { Milliseconds } from '@common/types';
import { getNowMilliseconds } from '@common/utils';
import type {
    TCoinId,
    TFullInfoByCoin,
} from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { ERuleGroups } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { isNil } from 'lodash-es';
import { useMemo } from 'react';
import type { NumberSchema } from 'yup';
import * as Yup from 'yup';
import type { ConditionOptions } from 'yup/lib/Condition';
import type { MixedSchema } from 'yup/lib/mixed';

import { commonValidationShape } from '../../components/utils';

export function useSchema(coinInfo: ReadonlyMap<TCoinId, TFullInfoByCoin>) {
    return useMemo(
        () =>
            Yup.object().shape({
                ...commonValidationShape(coinInfo),

                disabledGroups: Yup.mixed()
                    .required('Required')
                    .oneOf([ERuleGroups.All, ERuleGroups.Manual, ERuleGroups.Suggest]),

                isPermanent: Yup.boolean().required('Required'),

                startImmediately: Yup.boolean().required('Required'),
                startTime: Yup.number().when(['isPermanent', 'startImmediately'], ((
                    isPermanent: boolean,
                    startImmediately: boolean,
                    schema,
                ) =>
                    isPermanent || startImmediately
                        ? schema
                        : schema.required('Required')) as ConditionOptions<NumberSchema>),

                selectEndDate: Yup.boolean().required('Required'),
                endTime: Yup.number().when(
                    ['isPermanent', 'selectEndDate', 'startImmediately', 'startTime'],
                    ((
                        isPermanent: boolean,
                        selectEndDate: boolean,
                        startImmediately: boolean,
                        startTime: Milliseconds | undefined,
                        schema: NumberSchema,
                        endTimeField: undefined | { value: number | undefined },
                    ) =>
                        isPermanent || !selectEndDate
                            ? schema
                            : schema
                                  .required('Required')
                                  .test('limit-by-date', 'End time is less then Start time', () => {
                                      if (isNil(endTimeField) || isNil(endTimeField.value)) {
                                          return true;
                                      }

                                      return startImmediately
                                          ? endTimeField.value > getNowMilliseconds()
                                          : isNil(startTime) || endTimeField.value > startTime;
                                  })) as unknown as ConditionOptions<NumberSchema>,
                ),
                periodValue: Yup.number().when(['isPermanent', 'selectEndDate'], ((
                    isPermanent: boolean,
                    selectEndDate: boolean,
                    schema: NumberSchema,
                ) =>
                    isPermanent || selectEndDate
                        ? schema.optional().nullable(true)
                        : schema
                              .required('Required')
                              .nullable(true)) as unknown as ConditionOptions<NumberSchema>),
                periodUnit: Yup.mixed().when(['isPermanent', 'selectEndDate'], ((
                    isPermanent: boolean,
                    selectEndDate: boolean,
                    schema,
                ) =>
                    isPermanent || selectEndDate
                        ? schema
                        : schema
                              .required('Required')
                              .oneOf([
                                  'minutes',
                                  'hours',
                                  'days',
                                  'months',
                                  'years',
                              ])) as ConditionOptions<MixedSchema>),
            }),
        [coinInfo],
    );
}
