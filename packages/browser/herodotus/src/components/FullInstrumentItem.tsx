import { LinkOutlined } from '@ant-design/icons';
import { createTestProps } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { InputNumber } from '@frontend/common/src/components/InputNumber';
import { SelectAdvanced } from '@frontend/common/src/components/SelectAdvanced';
import { THerodotusPreRiskDataReturnType } from '@frontend/common/src/modules/actions/ModuleGetHerodotusPreRiskData';
import { TWithClassname } from '@frontend/common/src/types/components';
import { TAsset } from '@frontend/common/src/types/domain/asset';
import { EExchangeName, TExchange } from '@frontend/common/src/types/domain/exchange';
import { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import { getInstrumentByName } from '@frontend/common/src/utils/domain/instrument';
import { entityVirtualAccountIdToAccountName } from '@frontend/common/src/utils/entityIds.ts';
import { extractValidNumber } from '@frontend/common/src/utils/extract';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncObservable } from '@frontend/common/src/utils/React/useSyncObservable';
import { isSyncDesc } from '@frontend/common/src/utils/ValueDescriptor';
import cn from 'classnames';
import BigDecimal from 'js-big-decimal';
import { isFunction, isNil, isObject, isString } from 'lodash-es';
import { ReactElement, useEffect, useMemo } from 'react';
import { EMPTY, Observable } from 'rxjs';

import type { THerodotusTaskFormDataInstrument } from '../types';
import { EHerodotusTaskRole, THerodotusAccount } from '../types/domain';
import { formatUnitsLots } from '../utils/formatters';
import { TInstrumentFromErrors } from '../utils/instrumentFrom';
import { instrumentIsSuitableForAsset } from '../utils/isSuitable';
import { isV2HeroProtocolAccount } from '../utils/isV2HeroProtocol';
import { DisplayAmounts } from './DisplayAmounts';
import {
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
    getPreRiskDesc: (instrumentId: TInstrumentId) => Observable<THerodotusPreRiskDataReturnType>;
    orderSize: undefined | number;
    errors?: TInstrumentFromErrors;
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
    onReplace,
    onDelete,
}: TFullInstrumentItemProps): ReactElement {
    const handleSetRole = useFunction((v?: EHerodotusTaskRole) =>
        onReplace(value, updateRole(value, v ?? EHerodotusTaskRole.Unknown)),
    );
    const handleSetExchangeName = useFunction((v?: EExchangeName) => {
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
    const accountByAssets = useMemo(() => accounts, [asset, accounts, instrumentsByAssets]);
    const exchangeByAssets = useMemo(() => {
        return exchanges.filter((ex) => {
            return accountByAssets.some((acc) => acc.exchangeName === ex.name);
        });
    }, [exchanges, accountByAssets]);
    const accountsByExchange = useMemo(() => {
        return value.exchange !== undefined
            ? accountByAssets.filter((acc) => acc.exchangeName === value.exchange)
            : (EMPTY_ARRAY as THerodotusAccount[]);
    }, [accountByAssets, value.exchange]);
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

    const displayOrderAmount = useMemo(() => {
        if (isNil(instrument)) {
            return undefined;
        }

        const units = new BigDecimal(orderSize);
        const lots = units.divide(new BigDecimal(instrument.amountNotation.multiplier), undefined);

        return formatUnitsLots(units, lots, asset.name);
    }, [orderSize, instrument, asset.name]);

    const preRisk = useSyncObservable(
        isNil(instrument) ? EMPTY : getPreRiskDesc(instrument.id),
        undefined,
    );

    const displayMaxOrderAmount = useMemo(() => {
        if (isNil(instrument) || isNil(preRisk) || !isSyncDesc(preRisk) || isNil(preRisk.value)) {
            return undefined;
        }

        const lots = new BigDecimal(preRisk.value.maxOrderAmount);
        const units = lots.multiply(new BigDecimal(instrument.amountNotation.multiplier));

        return formatUnitsLots(units, lots, asset.name);
    }, [asset.name, instrument, preRisk]);
    const displayLotAmount = useMemo(() => {
        if (isNil(instrument)) {
            return undefined;
        }

        const lotAmountUnits = new BigDecimal(instrument.amountNotation.multiplier);

        return formatUnitsLots(lotAmountUnits, undefined, asset.name);
    }, [instrument, asset.name]);
    const displayStepAmount = useMemo(() => {
        if (isNil(instrument)) {
            return undefined;
        }

        const stepAmountUnits = new BigDecimal(instrument.stepQty.value).multiply(
            new BigDecimal(instrument.amountNotation.multiplier),
        );

        return formatUnitsLots(stepAmountUnits, undefined, asset.name);
    }, [instrument, asset.name]);

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
                    {instrumentsByExchangeAndAccount.map(({ name }) => (
                        <FormikSelect.Option key={name} value={name}>
                            {name}
                        </FormikSelect.Option>
                    ))}
                </SelectAdvanced>
            </div>

            <DisplayAmounts
                displayLotAmount={displayLotAmount}
                displayStepAmount={displayStepAmount}
                displayOrderAmount={displayOrderAmount}
                displayMaxOrderAmount={displayMaxOrderAmount}
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
