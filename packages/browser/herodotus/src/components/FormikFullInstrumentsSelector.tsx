import { createTestProps } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { cnAddInstrumentAction } from '@frontend/common/src/components/Formik/components/style.css';
import { Text } from '@frontend/common/src/components/Text';
import type { THerodotusPreRiskDataReturnType } from '@frontend/common/src/modules/actions/ModuleGetHerodotusPreRiskData';
import type { TWithStyle } from '@frontend/common/src/types/components';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import cn from 'classnames';
import { FieldArray } from 'formik';
import type { FormikFieldProps } from 'formik-antd/lib/FieldProps';
import { isUndefined } from 'lodash-es';
import { memo, ReactElement } from 'react';
import type { Observable } from 'rxjs';

import { EHerodotusTaskRole, THerodotusAccount, THerodotusConfigInstrument } from '../types/domain';
import { isInstrumentErrors } from '../utils/instrumentFrom';
import { FullInstrumentItem } from './FullInstrumentItem';
import { cnEvenInstrumentRow, cnOddInstrumentRow } from './style.css';

export const FormikFullInstrumentsSelector = memo(
    ({
        name,
        asset,
        roles,
        instruments,
        accounts,
        exchanges,
        getPreRiskDesc,
        orderSize,
    }: FormikFieldProps &
        TWithStyle & {
            asset: TAsset;
            roles?: EHerodotusTaskRole[];
            instruments: TInstrument[];
            accounts: THerodotusAccount[];
            exchanges: TExchange[];
            getPreRiskDesc: (
                instrumentId: TInstrumentId,
            ) => Observable<THerodotusPreRiskDataReturnType>;
            orderSize: undefined | number;
        }): ReactElement => (
        <FieldArray
            name={name}
            render={({ remove, push, form }) => {
                const errors = form.errors[name];
                // We must render at least 1 item in any list
                const values = form.values[name].length === 0 ? [{}] : form.values[name];
                return (
                    <>
                        {values.map(
                            (
                                formInstrument: Partial<THerodotusConfigInstrument>,
                                index: number,
                            ) => (
                                <FullInstrumentItem
                                    key={index}
                                    className={cn({
                                        [cnEvenInstrumentRow]: index % 2 === 0,
                                        [cnOddInstrumentRow]: index % 2 === 1,
                                    })}
                                    asset={asset}
                                    roles={roles}
                                    instruments={instruments}
                                    accounts={accounts}
                                    exchanges={exchanges}
                                    value={formInstrument}
                                    getPreRiskDesc={getPreRiskDesc}
                                    orderSize={orderSize}
                                    errors={isInstrumentErrors(errors) ? errors[index] : undefined}
                                    onReplace={(prev, next) =>
                                        form.setFieldValue(`${name}.${index}`, next)
                                    }
                                    onDelete={index === 0 ? undefined : () => void remove(index)}
                                />
                            ),
                        )}

                        <div className={cnAddInstrumentAction}>
                            <Button
                                {...createTestProps(EAddTaskTabSelectors.AddInstrumentButton)}
                                size="small"
                                onClick={() => {
                                    push({});
                                }}
                            >
                                + Add
                            </Button>
                        </div>

                        <Text type="danger">
                            {!isUndefined(errors) ? 'Fill in the fields correctly' : null}
                        </Text>
                    </>
                );
            }}
        />
    ),
);
