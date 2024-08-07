import { Button } from '@frontend/common/src/components/Button';
import { Descriptions } from '@frontend/common/src/components/Descriptions';
import { FormikForm } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { Modal } from '@frontend/common/src/components/Modals';
import type { TBlockchainNetworkId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import { Formik } from 'formik';
import { isEmpty, isNil, sortBy, uniqBy } from 'lodash-es';
import { memo, useMemo, useRef } from 'react';
import { useMount } from 'react-use';

import { AccountWithExchangeIcon } from '../../components/AccountWithExchangeIcon';
import { AmountWithUsdAmount } from '../../components/AmountWithUsdAmount';
import { DEFAULT_FILTER_OPTION } from '../../components/utils';
import type { TConvertRatesDescriptor } from '../../modules/actions/ModuleSubscribeToConvertRatesOnCurrentStage.ts';
import type { TConfirmationTransferAction } from './defs';
import { cnActionButton, cnActionsContainer, cnNetworkSelector } from './styles.css';

const AUTO_NETWORK = 0;

type TTransferValues = {
    network: TBlockchainNetworkId | typeof AUTO_NETWORK;
};

const INITIAL_OPTIONS: TTransferValues = { network: AUTO_NETWORK };

export const TransferConfirmationModal = memo(
    ({
        from,
        fromExchange,
        to,
        toExchange,
        amount,
        coin,
        networks,
        convertRatesDesc,
        onCancel,
        onConfirm,
    }: Omit<TConfirmationTransferAction, 'traceId'> & {
        convertRatesDesc: TConvertRatesDescriptor;
        onCancel: VoidFunction;
        onConfirm: (network?: TBlockchainNetworkId) => void;
    }) => {
        const convertRate = useMemo(
            () =>
                isSyncedValueDescriptor(convertRatesDesc)
                    ? convertRatesDesc.value.get(coin)
                    : undefined,
            [convertRatesDesc, coin],
        );

        const submit = useFunction((values: TTransferValues) =>
            onConfirm(values.network === AUTO_NETWORK ? undefined : values.network),
        );

        const possibleNetworks = useMemo(
            () =>
                isEmpty(networks)
                    ? []
                    : sortBy(
                          uniqBy(networks, ({ network }) => network),
                          ({ networkPriority }) => networkPriority,
                      ),
            [networks],
        );

        const networkOptions = useMemo(
            () => [
                {
                    label: 'Auto',
                    value: AUTO_NETWORK,
                },
                ...possibleNetworks.map(({ network }) => ({
                    label: network,
                    value: network,
                })),
            ],
            [possibleNetworks],
        );

        const okRef = useRef<HTMLElement>(null);

        useMount(() => {
            if (isNil(okRef.current)) {
                return;
            }

            okRef.current.focus();
        });

        return (
            <Modal title="Transfer confirmation" open onCancel={onCancel} footer={null}>
                <Formik<TTransferValues> initialValues={INITIAL_OPTIONS} onSubmit={submit}>
                    {() => (
                        <FormikForm>
                            <Descriptions bordered layout="horizontal" column={1} size="small">
                                <Descriptions.Item label="From">
                                    <AccountWithExchangeIcon
                                        account={from}
                                        exchange={fromExchange}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="To">
                                    <AccountWithExchangeIcon account={to} exchange={toExchange} />
                                </Descriptions.Item>
                                <Descriptions.Item label="Amount">
                                    <AmountWithUsdAmount
                                        amount={amount}
                                        coin={coin}
                                        convertRate={convertRate}
                                    />
                                </Descriptions.Item>
                                <Descriptions.Item label="Network">
                                    <FormikSelect
                                        className={cnNetworkSelector}
                                        name="network"
                                        showSearch
                                        disabled={networkOptions.length === 1}
                                        options={networkOptions}
                                        filterOption={DEFAULT_FILTER_OPTION}
                                        optionLabelProp="label"
                                        sort={false}
                                    />
                                </Descriptions.Item>
                            </Descriptions>
                            <div className={cnActionsContainer}>
                                <Button className={cnActionButton} onClick={onCancel}>
                                    Cancel
                                </Button>
                                <Button
                                    ref={okRef}
                                    className={cnActionButton}
                                    htmlType="submit"
                                    type="primary"
                                >
                                    Send
                                </Button>
                            </div>
                        </FormikForm>
                    )}
                </Formik>
            </Modal>
        );
    },
);
