import { LinkOutlined, ReloadOutlined, WarningOutlined } from '@ant-design/icons';
import type { Nil } from '@common/types';
import { extractValidNumber } from '@common/utils/src/extract.ts';
import { createTestProps } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { InputNumber } from '@frontend/common/src/components/InputNumber';
import { SelectAdvanced } from '@frontend/common/src/components/SelectAdvanced';
import type { TFunding } from '@frontend/common/src/modules/actions/components/ModuleGetComponentFundingOnCurrentStage.ts';
import type { THerodotusPreRiskData } from '@frontend/common/src/modules/actions/herodotus/ModuleGetHerodotusPreRiskData.ts';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import { EInstrumentStatus } from '@frontend/common/src/types/domain/instrument';
import { blue, grey, orange, red } from '@frontend/common/src/utils/colors.ts';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { getInstrumentByName } from '@frontend/common/src/utils/domain/instrument';
import { entityVirtualAccountIdToAccountName } from '@frontend/common/src/utils/entityIds.ts';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useNotifiedValueDescriptorObservable } from '@frontend/common/src/utils/React/useValueDescriptorObservable.ts';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import {
    isEmptyValueDescriptor,
    isLoadingValueDescriptor,
} from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import cn from 'classnames';
import { isFunction, isNil, isObject, isString } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo } from 'react';
import type { Observable } from 'rxjs';
import { EMPTY } from 'rxjs';

import type { THerodotusTaskFormDataInstrument } from '../types';
import type { THerodotusAccount } from '../types/domain';
import { EHerodotusTaskRole } from '../types/domain';
import type { TInstrumentFromErrors } from '../utils/instrumentFrom';
import { instrumentIsSuitableForAsset } from '../utils/isSuitable';
import { isV2HeroProtocolAccount } from '../utils/isV2HeroProtocol';
import { DisplayAmounts } from './DisplayAmounts';
import { useDisplayBalances } from './hooks/useDisplayBalances';
import { useDisplayLotAmount } from './hooks/useDisplayLotAmount.ts';
import { useDisplayMaxOrderAmount } from './hooks/useDisplayMaxOrderAmount.ts';
import { useDisplayOrderAmount } from './hooks/useDisplayOrderAmount.ts';
import { useDisplayStepAmount } from './hooks/useDisplayStepAmount.ts';
import {
    cnFundingActions,
    cnInstrument,
    cnInstrumentAccount,
    cnInstrumentAggression,
    cnInstrumentExchange,
    cnInstrumentName,
    cnInstrumentRole,
    cnRowActions,
} from './style.css';

type TFullInstrumentItemProps = TWithClassname & {
    value: THerodotusTaskFormDataInstrument;
    asset: TAsset;
    roles?: EHerodotusTaskRole[];
    instruments: TInstrument[];
    accounts: THerodotusAccount[];
    exchanges: TExchange[];
    getPreRiskDesc: (
        instrumentId: TInstrumentId,
    ) => Observable<TValueDescriptor2<Nil | THerodotusPreRiskData>>;
    orderSize: undefined | number;
    errors?: TInstrumentFromErrors;
    assets: TAsset[];
    getFunding(
        instrumentId: TInstrumentId,
        virtualAccountId: string | TVirtualAccountId,
    ): Observable<TValueDescriptor2<TFunding>>;
    onReplace: (
        oldInstrument: THerodotusTaskFormDataInstrument,
        newInstrument: THerodotusTaskFormDataInstrument,
    ) => void;
    onDelete?: (instrument: THerodotusTaskFormDataInstrument) => void | undefined;
};

export function FullInstrumentItem({
    className,
    asset,
    value,
    roles,
    instruments,
    accounts,
    exchanges,
    getPreRiskDesc,
    orderSize,
    errors,
    assets,
    getFunding,
    onReplace,
    onDelete,
}: TFullInstrumentItemProps): ReactElement {
    const handleSetRole = useFunction((v?: EHerodotusTaskRole) =>
        onReplace(value, updateRole(value, v ?? EHerodotusTaskRole.Unknown)),
    );
    const handleSetExchangeName = useFunction((v?: TExchange['name']) => {
        if (value.exchange === v) return;
        onReplace(value, updateExchangeName(value, v));
    });
    const setAccountName = useFunction((v?: string) => {
        if (value.account === v) return;
        onReplace(value, updateAccountName(value, v));
    });
    const setInstrumentName = useFunction((v?: string) =>
        onReplace(value, updateInstrumentName(value, v)),
    );
    const setAggression = useFunction((v: number | null) =>
        onReplace(value, updateAggression(value, v ?? undefined)),
    );
    const deleteInstrument = useFunction(() => onDelete?.(value));

    const instrumentsByAssets = useMemo(() => {
        return instruments.filter((inst) => {
            return instrumentIsSuitableForAsset(inst, asset);
        });
    }, [asset, instruments]);
    const accountsByAssets = useMemo(() => accounts, [asset, accounts, instrumentsByAssets]);
    const exchangeByAssets = useMemo(() => {
        return exchanges.filter((ex) => {
            return accountsByAssets.some((acc) => acc.exchangeName === ex.name);
        });
    }, [exchanges, accountsByAssets]);
    const accountsByExchange = useMemo(() => {
        return value.exchange !== undefined
            ? accountsByAssets.filter((acc) => acc.exchangeName === value.exchange)
            : (EMPTY_ARRAY as THerodotusAccount[]);
    }, [accountsByAssets, value.exchange]);
    const instrumentsByExchangeAndAccount = useMemo(() => {
        if (value.exchange === undefined || value.account === undefined) {
            return EMPTY_ARRAY as TInstrument[];
        }

        return instrumentsByAssets.filter((inst) => {
            return inst.exchange === value.exchange;
        });
    }, [value.exchange, value.account, accounts, instrumentsByAssets]);
    const instrument = useMemo(
        () => getInstrumentByName(instruments, value.exchange, value.name),
        [instruments, value.exchange, value.name],
    );

    const preRisk = useNotifiedValueDescriptorObservable(
        useMemo(
            () => (isNil(instrument) ? EMPTY : getPreRiskDesc(instrument.id)),
            [instrument?.id],
        ),
    );

    const displayOrderAmount = useDisplayOrderAmount(instrument, orderSize, asset);
    const displayMaxOrderAmount = useDisplayMaxOrderAmount(instrument, preRisk, asset);
    const displayLotAmount = useDisplayLotAmount(instrument, asset);
    const displayStepAmount = useDisplayStepAmount(instrument, asset);

    const { fundingsDesc, refreshFundings } = useDisplayBalances(
        value.account,
        instrument?.id,
        assets,
        getFunding,
    );

    useEffect(() => {
        if (roles) {
            handleSetRole(value.role && roles.includes(value.role) ? value.role : roles[0]);
        }
    }, [handleSetRole, roles, value.role]);

    const inputNumberParser = useFunction((v) => extractValidNumber(v) ?? NaN);

    return (
        <div className={cn(cnInstrument, className)}>
            <div className={cnInstrumentExchange}>
                <SelectAdvanced
                    {...createTestProps(EAddTaskTabSelectors.ExchangeSelector)}
                    size="small"
                    showSearch
                    allowClear
                    placeholder="Exchange"
                    value={value.exchange}
                    onChange={handleSetExchangeName}
                    onClear={handleSetExchangeName}
                    status={getFieldStatus(errors, 'exchange')}
                >
                    {exchangeByAssets.map(({ name }) => (
                        <FormikSelect.Option key={name} value={name}>
                            {name}
                        </FormikSelect.Option>
                    ))}
                </SelectAdvanced>
            </div>
            <div className={cnInstrumentAccount}>
                <SelectAdvanced
                    {...createTestProps(EAddTaskTabSelectors.AccountSelector)}
                    size="small"
                    showSearch
                    allowClear
                    placeholder="Account"
                    notFoundContent="Exchange not selected"
                    value={value.account}
                    onChange={setAccountName}
                    onClear={setAccountName}
                    status={getFieldStatus(errors, 'account')}
                >
                    {accountsByExchange.map((acc) => {
                        const name = isV2HeroProtocolAccount(acc)
                            ? entityVirtualAccountIdToAccountName(acc.virtualAccountId)
                            : acc.name;
                        const value = isV2HeroProtocolAccount(acc)
                            ? acc.virtualAccountId
                            : acc.name;

                        return (
                            <FormikSelect.Option key={value} value={value}>
                                {name}
                            </FormikSelect.Option>
                        );
                    })}
                </SelectAdvanced>
            </div>
            <div className={cnInstrumentName}>
                <SelectAdvanced
                    {...createTestProps(EAddTaskTabSelectors.InstrumentSelector)}
                    size="small"
                    showSearch
                    allowClear
                    placeholder="Instrument"
                    notFoundContent="Instrument not selected"
                    value={value.name}
                    onChange={setInstrumentName}
                    onClear={setInstrumentName}
                    status={getFieldStatus(errors, 'name')}
                >
                    {instrumentsByExchangeAndAccount.map(({ name, status }) => (
                        <FormikSelect.Option key={name} value={name}>
                            {name}{' '}
                            {status !== EInstrumentStatus.Trading && (
                                <WarningOutlined
                                    style={{ color: getInstrumentStatusColor(status) }}
                                    title={`Instrument status is ${status}`}
                                />
                            )}
                        </FormikSelect.Option>
                    ))}
                </SelectAdvanced>
            </div>

            <DisplayAmounts
                displayLotAmount={displayLotAmount}
                displayStepAmount={displayStepAmount}
                displayOrderAmount={displayOrderAmount}
                displayMaxOrderAmount={displayMaxOrderAmount}
                displayBalance={fundingsDesc.value?.displayBalance}
                displayReferenceBalance={fundingsDesc.value?.displayReferenceBalance}
                displayPosition={fundingsDesc.value?.displayPosition}
            />

            <div className={cnRowActions}>
                {isFunction(onDelete) ? (
                    <Button
                        {...createTestProps(EAddTaskTabSelectors.DeleteInstrumentButton)}
                        size="small"
                        onClick={deleteInstrument}
                    >
                        -
                    </Button>
                ) : null}
                {!isNil(instrument?.href) && (
                    <a href={instrument.href} target="_blank" rel="noreferrer">
                        <Button size="small" icon={<LinkOutlined />} />
                    </a>
                )}
            </div>

            {!isNil(roles) && (
                <>
                    <div className={cnInstrumentRole}>
                        <SelectAdvanced
                            {...createTestProps(EAddTaskTabSelectors.InstrumentRoleSelector)}
                            size="small"
                            placeholder="Role"
                            value={value.role}
                            disabled={roles.length === 1}
                            onChange={handleSetRole}
                        >
                            {roles.map((role) => (
                                <FormikSelect.Option key={role} value={role}>
                                    {role}
                                </FormikSelect.Option>
                            ))}
                        </SelectAdvanced>
                    </div>
                    <div className={cnInstrumentAggression}>
                        <InputNumber<number>
                            {...createTestProps(EAddTaskTabSelectors.InstrumentAggressionInput)}
                            size="small"
                            placeholder="Aggression"
                            value={value.aggression}
                            addonAfter="%"
                            parser={inputNumberParser}
                            onChange={setAggression}
                        />
                    </div>
                </>
            )}

            <div className={cnFundingActions}>
                <Button
                    size="small"
                    icon={<ReloadOutlined />}
                    title="Refresh balances"
                    loading={isLoadingValueDescriptor(fundingsDesc)}
                    disabled={
                        isLoadingValueDescriptor(fundingsDesc) ||
                        isEmptyValueDescriptor(fundingsDesc)
                    }
                    onClick={refreshFundings}
                />
            </div>
        </div>
    );
}

function updateRole(
    state: THerodotusTaskFormDataInstrument,
    role: THerodotusTaskFormDataInstrument['role'],
): THerodotusTaskFormDataInstrument {
    return {
        ...state,
        role,
    };
}

function updateExchangeName(
    state: THerodotusTaskFormDataInstrument,
    exchange: THerodotusTaskFormDataInstrument['exchange'],
): THerodotusTaskFormDataInstrument {
    return {
        ...state,
        exchange,
        account: undefined,
        name: undefined,
    };
}

function updateAccountName(
    state: THerodotusTaskFormDataInstrument,
    account: THerodotusTaskFormDataInstrument['account'],
): THerodotusTaskFormDataInstrument {
    return {
        ...state,
        account,
        name: undefined,
    };
}

function updateInstrumentName(
    state: THerodotusTaskFormDataInstrument,
    name: THerodotusTaskFormDataInstrument['name'],
): THerodotusTaskFormDataInstrument {
    return {
        ...state,
        name,
    };
}

function updateAggression(
    state: THerodotusTaskFormDataInstrument,
    aggression: THerodotusTaskFormDataInstrument['aggression'],
): THerodotusTaskFormDataInstrument {
    return {
        ...state,
        aggression,
    };
}

function getFieldStatus(
    errors: TInstrumentFromErrors | undefined,
    name: keyof TInstrumentFromErrors,
): 'error' | undefined {
    if (isObject(errors) && isString(errors[name])) return 'error';

    return undefined;
}

function getInstrumentStatusColor(status: EInstrumentStatus): string | undefined {
    const colors: Partial<Record<EInstrumentStatus, string>> = {
        [EInstrumentStatus.CloseOnly]: grey[0],
        [EInstrumentStatus.Forbidden]: grey[0],
        [EInstrumentStatus.Delisted]: red[5],
        [EInstrumentStatus.CancelOnly]: blue[5],
        [EInstrumentStatus.Halt]: orange[5],
    };

    return colors[status];
}
