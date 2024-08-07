import { LoadingOutlined, UndoOutlined } from '@ant-design/icons';
import type { Nil } from '@common/types';
import { assert } from '@common/utils/src/assert.ts';
import { createTestProps } from '@frontend/common/e2e';
import { EAddTaskTabSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/components/add-task-tab/add-task.tab.selectors';
import { Alert } from '@frontend/common/src/components/Alert';
import { Button } from '@frontend/common/src/components/Button';
import type { TWithFormik } from '@frontend/common/src/components/Formik';
import { FormikForm, FormikInputNumber } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import { validateBySchema } from '@frontend/common/src/components/Formik/utils';
import { Col, Row } from '@frontend/common/src/components/Grid';
import { useConvertRates } from '@frontend/common/src/components/hooks/useConvertRates';
import { FakeInput, InputGroup } from '@frontend/common/src/components/Input';
import { Space } from '@frontend/common/src/components/Space.ts';
import type { TFunding } from '@frontend/common/src/modules/actions/components/ModuleGetComponentFundingOnCurrentStage.ts';
import type { THerodotusPreRiskData } from '@frontend/common/src/modules/actions/herodotus/ModuleGetHerodotusPreRiskData.ts';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TVirtualAccountId } from '@frontend/common/src/types/domain/account';
import { ECurrency } from '@frontend/common/src/types/domain/currency.ts';
import type { TInstrument, TInstrumentId } from '@frontend/common/src/types/domain/instrument';
import { ESide } from '@frontend/common/src/types/domain/task';
import { getInstrumentByName } from '@frontend/common/src/utils/domain/instrument';
import { formatUsdCompact } from '@frontend/common/src/utils/formatNumber/formatNumber';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import type { TValueDescriptor2 } from '@frontend/common/src/utils/ValueDescriptor/types.ts';
import { isSyncedValueDescriptor } from '@frontend/common/src/utils/ValueDescriptor/utils.ts';
import cn from 'classnames';
import { Formik } from 'formik';
import BigDecimal from 'js-big-decimal';
import { isEmpty, isNil, isUndefined } from 'lodash-es';
import memoize from 'memoizee';
import type { ReactElement } from 'react';
import { useCallback, useEffect, useMemo } from 'react';
import type { Observable } from 'rxjs';
import type { NumberSchema } from 'yup';
import * as Yup from 'yup';
import type { ConditionBuilder } from 'yup/lib/Condition';

import type { THerodotusData } from '../hooks/useHerodotusData';
import { useMaxPremiumConfirmation } from '../hooks/useMaxPremiumConfirmation';
import type { THerodotusTaskFormData, THerodotusTaskFormDataInstrument } from '../types';
import type { THerodotusConfig } from '../types/domain';
import { EAmountType, EHerodotusTaskRole, EPriceLimitCurrencyType } from '../types/domain';
import { getFirstQuoteCurrencyName, hasCommonQuoteCurrency } from '../utils/currency';
import { formatUnitsLots } from '../utils/formatters';
import { getMainSizeBigDecimal, getPrecisionBigDecimal } from '../utils/math';
import { cnForm, cnInstrumentGroup, cnInstrumentGroupLabel } from './FormHerodotusTask.css';
import { FormikFullInstrumentsSelector } from './FormikFullInstrumentsSelector';
import { OnlyTradingInstrumentsSwitch } from './OnlyTradingInstrumentsSwitch.tsx';

type TFormHerodotusTaskProps = TWithClassname & {
    herodotusData: THerodotusData;
    formData?: THerodotusTaskFormData;
    getPreRiskDesc: (
        instrumentId: TInstrumentId,
    ) => Observable<TValueDescriptor2<Nil | THerodotusPreRiskData>>;
    getFunding: (
        instrumentId: TInstrumentId,
        virtualAccountId: string | TVirtualAccountId,
        side: ESide,
    ) => Observable<TValueDescriptor2<TFunding>>;
    referenceCurrencyDesc: TValueDescriptor2<string>;
    onSubmit: (task: THerodotusConfig) => Promise<unknown>;
    onReset: () => void;
};

const INITIAL_VALUES: THerodotusTaskFormData = {
    type: ESide.Buy,
    assetName: '',
    amount: 0,
    orderSize: 0,
    priceLimit: undefined,
    currencyType: EPriceLimitCurrencyType.Reference,
    maxPremium: 0,
    aggression: 0,
    buyInstruments: [],
    sellInstruments: [],
};
const ALL_ROLES = [EHerodotusTaskRole.Quote, EHerodotusTaskRole.Hedge];
const ONLY_QUOTE_ROLES = [EHerodotusTaskRole.Quote];

const schemaFullInstrumentV2 = Yup.object().shape({
    role: Yup.string().required(),
    exchange: Yup.string().required(),
    account: Yup.string().required(),
    name: Yup.string().required(),
    aggression: Yup.number().nullable(true),
});

const testFullInstruments = () => {
    return Yup.array().of(schemaFullInstrumentV2).min(1, 'Required').required('Required');
};

export function FormHerodotusTask(props: TFormHerodotusTaskProps): ReactElement {
    const {
        herodotusData: { instruments },
        onSubmit,
    } = props;

    const orderAmountValidator = useOrderAmountValidator(instruments!);

    const getSchema = useMemo(
        () =>
            memoize((type: ESide) => {
                const isBuy = type === ESide.Buy;
                const isSell = type === ESide.Sell;
                const isBuySell = type === ESide.BuySell;
                const withBuy = isBuySell || isBuy;
                const withSell = isBuySell || isSell;

                return Yup.object().shape({
                    type: Yup.string().required('Required'),
                    assetName: Yup.string().required('Required'),
                    exchangeName: Yup.string().optional(),
                    accountName: Yup.string().optional(),
                    amount: Yup.number()
                        .moreThan(0, 'Amount should be greater then 0')
                        .required('Total Amount is required')
                        .nullable(true),
                    buyInstruments: withBuy ? testFullInstruments() : Yup.array().optional(),
                    sellInstruments: withSell ? testFullInstruments() : Yup.array().optional(),
                    orderSize: Yup.number()
                        .moreThan(0, 'Order Amount should be greater then 0')
                        .required('Order Amount is required')
                        .when(
                            ['assetName', 'buyInstruments', 'sellInstruments'],
                            orderAmountValidator,
                        )
                        .when('amount', (amount: number | undefined, schema) =>
                            isNil(amount) || amount === 0
                                ? schema
                                : schema.max(
                                      Yup.ref('amount'),
                                      `Order Amount must be less than or equal to ${amount}`,
                                  ),
                        ),
                    priceLimit: isBuySell
                        ? Yup.number().optional()
                        : Yup.number()
                              .moreThan(0, 'Max Price should be greater then 0')
                              .required('Max Price is required')
                              .nullable(true),
                    currencyType: isBuySell
                        ? Yup.mixed().optional()
                        : Yup.mixed()
                              .oneOf([
                                  EPriceLimitCurrencyType.Quote,
                                  EPriceLimitCurrencyType.Reference,
                              ])
                              .required('Required'),
                    maxPremium: isBuySell
                        ? Yup.number().required('Max Premium is required').nullable(true)
                        : Yup.number().optional(),
                    aggression: Yup.number().required('Aggression is required').nullable(true),
                });
            }),
        [orderAmountValidator],
    );

    const cbValidate = useFunction(async (fields: THerodotusTaskFormData) => {
        const schema = getSchema(fields.type);

        return validateBySchema(fields, schema);
    });

    const cbConfirmMaxPremium = useMaxPremiumConfirmation();

    const cbSubmit = useFunction(async (fields: THerodotusTaskFormData) => {
        const isBuy = fields.type === ESide.Buy;
        const isSell = fields.type === ESide.Sell;
        const isBuySell = fields.type === ESide.BuySell;
        const withBuy = isBuySell || isBuy;
        const withSell = isBuySell || isSell;

        let priceLimit: THerodotusConfig['priceLimit'] = null;
        if (!isBuySell) {
            priceLimit = fields.priceLimit !== undefined ? fields.priceLimit : null;
        } else if (!(await cbConfirmMaxPremium(fields.maxPremium!))) {
            return false;
        }

        await onSubmit({
            taskType: fields.type,
            amount: {
                [EAmountType.Base]: fields.amount,
            },
            orderSize: fields.orderSize,
            priceLimit:
                fields.currencyType === EPriceLimitCurrencyType.Reference ? priceLimit : undefined,
            priceLimitInQuoteCurrency:
                fields.currencyType === EPriceLimitCurrencyType.Quote ? priceLimit : undefined,
            maxPremium: isBuySell ? fields.maxPremium : null,
            aggression: fields.aggression,
            asset: fields.assetName,
            buyInstruments: withBuy
                ? fields.buyInstruments.map((fullInst) => ({
                      role: fullInst.role!,
                      name: fullInst.name!,
                      exchange: fullInst.exchange!,
                      account: fullInst.account!,
                      aggression: fullInst.aggression,
                  }))
                : [],
            sellInstruments: withSell
                ? fields.sellInstruments.map((fullInst) => ({
                      role: fullInst.role!,
                      name: fullInst.name!,
                      exchange: fullInst.exchange!,
                      account: fullInst.account!,
                      aggression: fullInst.aggression,
                  }))
                : [],
        });

        return true;
    });

    return (
        <Formik<THerodotusTaskFormData>
            initialValues={INITIAL_VALUES}
            validate={cbValidate}
            validateOnMount
            onSubmit={cbSubmit}
        >
            {(formik) => <FormHerodotusTaskRenderer formik={formik} {...props} />}
        </Formik>
    );
}

function FormHerodotusTaskRenderer(
    props: TWithFormik<THerodotusTaskFormData> & TFormHerodotusTaskProps,
): ReactElement {
    const { formData, className, getPreRiskDesc, referenceCurrencyDesc } = props;
    const { accounts, exchanges, instruments, assets, enabled } = props.herodotusData;
    const {
        values,
        errors,
        setValues,
        setFieldValue,
        resetForm,
        validateForm,
        isValidating,
        isSubmitting,
    } = props.formik;

    const asset = useMemo(
        () => assets.find((a) => a.name === values.assetName),
        [assets, values.assetName],
    );

    const { convertRatesMap, loading: convertRatesLoading } = useConvertRates(values.assetName);
    const convertRateUSD = useMemo(
        () => convertRatesMap?.get(values.assetName)?.rate,
        [convertRatesMap, values.assetName],
    );

    const convertRate = useMemo(() => {
        if (convertRatesLoading) {
            return (
                <Space>
                    <LoadingOutlined />
                    <span>
                        Loading convert rate {values.assetName}/{ECurrency.USD}...
                    </span>
                </Space>
            );
        }

        if (isNil(convertRateUSD) || isNil(values.amount)) {
            return null;
        }

        return (
            <span>
                *{convertRateUSD}
                {' ~= '}
                <b>{formatUsdCompact(values.amount * convertRateUSD)}</b>
            </span>
        );
    }, [values.amount, values.assetName, convertRateUSD, convertRatesLoading]);

    const orderAmountConvertRate = useMemo(() => {
        if (isNil(convertRateUSD) || isNil(values.orderSize) || values.orderSize === 0) {
            return null;
        }

        return (
            <span>
                <span>~ </span>
                <b>{formatUsdCompact(values.orderSize * convertRateUSD)}</b>
            </span>
        );
    }, [values.orderSize, convertRateUSD]);

    const isBuySell = values.type === ESide.BuySell;
    const withBuy = isBuySell || values.type === ESide.Buy;
    const withSell = isBuySell || values.type === ESide.Sell;
    const roles = isBuySell ? ALL_ROLES : ONLY_QUOTE_ROLES;

    const oneWayInstruments = isBuySell
        ? undefined
        : values.type === ESide.Buy
          ? values.buyInstruments
          : values.sellInstruments;
    const canUseCurrencyTypeQuote =
        oneWayInstruments !== undefined
            ? oneWayInstruments.length === 0 ||
              hasCommonQuoteCurrency(instruments, oneWayInstruments)
            : false;
    const referenceCurrency = isSyncedValueDescriptor(referenceCurrencyDesc)
        ? referenceCurrencyDesc.value
        : undefined;
    const currencyLabel =
        oneWayInstruments !== undefined && values.currencyType === EPriceLimitCurrencyType.Quote
            ? getFirstQuoteCurrencyName(instruments, oneWayInstruments) ?? undefined
            : referenceCurrency;
    const currencyTypeOptions = useMemo(
        () => [
            {
                value: EPriceLimitCurrencyType.Reference,
                label: EPriceLimitCurrencyType.Reference,
            },
            {
                value: EPriceLimitCurrencyType.Quote,
                label: EPriceLimitCurrencyType.Quote,
                disabled: !canUseCurrencyTypeQuote,
            },
        ],
        [canUseCurrencyTypeQuote],
    );

    /* Reset buy and sell instrument when switching asset names */
    const cbChangeAssetName = useFunction((assetName: string) => {
        if (assetName !== values.assetName) {
            setFieldValue('buyInstruments', [{}]);
            setFieldValue('sellInstruments', [{}]);
            setFieldValue('priceLimit', undefined);
        }
    });

    /* Restore form data from URL parameter, if present */
    useEffect(() => {
        try {
            if (formData) {
                setValues(formData, true);
            } else {
                resetForm();
                setValues(INITIAL_VALUES, true);
                void validateForm(INITIAL_VALUES);
            }
        } catch {}
    }, [formData, resetForm, setValues, validateForm]);

    /* Auto select currency type when possible */
    useEffect(() => {
        if (!canUseCurrencyTypeQuote) {
            setFieldValue('currencyType', EPriceLimitCurrencyType.Reference);
        }
    }, [setFieldValue, canUseCurrencyTypeQuote]);

    /* Auto set Max Price when possible */
    const cbSetPriceLimit = useFunction(() => setFieldValue('priceLimit', convertRateUSD));
    useEffect(() => {
        if (isUndefined(values.priceLimit) && !isNil(convertRateUSD)) {
            cbSetPriceLimit();
        }
    }, [values.priceLimit, convertRateUSD]);

    const resetFormData = useFunction(() => {
        props.onReset();
        resetForm();
        setValues(INITIAL_VALUES, true);
        void validateForm(INITIAL_VALUES);
    });

    const getBuyFundingHandler = useCallback(
        (
            instrumentId: TInstrumentId,
            virtualAccountId: string | TVirtualAccountId,
        ): Observable<TValueDescriptor2<TFunding>> =>
            props.getFunding(instrumentId, virtualAccountId, ESide.Buy),
        [props.getFunding],
    );

    const getSellFundingHandler = useCallback(
        (
            instrumentId: TInstrumentId,
            virtualAccountId: string | TVirtualAccountId,
        ): Observable<TValueDescriptor2<TFunding>> =>
            props.getFunding(instrumentId, virtualAccountId, ESide.Sell),
        [props.getFunding],
    );

    return (
        <FormikForm
            {...createTestProps(EAddTaskTabSelectors.AddTaskTab)}
            layout="vertical"
            className={cn(cnForm, className)}
        >
            <Row gutter={[8, 16]}>
                {enabled ? null : (
                    <Col span={24}>
                        <Alert
                            type="warning"
                            showIcon
                            message="Robot is currently disabled. Start robot to add tasks."
                        />
                    </Col>
                )}
                <Col span={4}>
                    <FormikForm.Item label="Task Type" name="type">
                        <FormikSelect
                            {...createTestProps(EAddTaskTabSelectors.TaskTypeSelector)}
                            name="type"
                        >
                            <FormikSelect.Option key={ESide.Buy} value={ESide.Buy}>
                                Buy
                            </FormikSelect.Option>
                            <FormikSelect.Option key={ESide.Sell} value={ESide.Sell}>
                                Sell
                            </FormikSelect.Option>
                            <FormikSelect.Option key={ESide.BuySell} value={ESide.BuySell}>
                                BuySell
                            </FormikSelect.Option>
                        </FormikSelect>
                    </FormikForm.Item>
                </Col>
                <Col span={8}>
                    <FormikForm.Item label="Base Asset" name="assetName">
                        <FormikSelect
                            {...createTestProps(EAddTaskTabSelectors.BaseAssetSelector)}
                            name="assetName"
                            showSearch
                            onSelect={cbChangeAssetName}
                            loading={assets.length === 0}
                        >
                            {assets.map(({ name, id }) => (
                                <FormikSelect.Option key={id} value={name}>
                                    {name}
                                </FormikSelect.Option>
                            ))}
                        </FormikSelect>
                    </FormikForm.Item>
                </Col>
                <Col span={12}>
                    <FormikForm.Item
                        {...createTestProps(EAddTaskTabSelectors.TotalAmountLabel)}
                        label={`Total Amount${
                            isEmpty(values.assetName) ? '' : `, ${values.assetName}`
                        }`}
                        name="amount"
                    >
                        <FormikInputNumber
                            {...createTestProps(EAddTaskTabSelectors.TotalAmountInput)}
                            style={{ width: '100%' }}
                            name="amount"
                            min={0}
                        />
                        {convertRate}
                    </FormikForm.Item>
                </Col>
            </Row>

            {asset && withBuy && (
                <FormikForm.Item
                    {...createTestProps(EAddTaskTabSelectors.BuyInstrumentsForm)}
                    className={cnInstrumentGroup}
                    label={
                        <div className={cnInstrumentGroupLabel}>
                            <span>Buy Instruments</span>
                            <span>
                                <OnlyTradingInstrumentsSwitch />
                            </span>
                        </div>
                    }
                    /**
                     * HACK: The '_field' suffix is crucial here.
                     * We prevent Formik from attempting to render errors directly from the object,
                     * which can lead to rendering issues and crashes
                     */
                    name="buyInstruments_field"
                >
                    <FormikFullInstrumentsSelector
                        key={values.type}
                        name="buyInstruments"
                        style={{ width: '100%' }}
                        assets={assets}
                        asset={asset}
                        roles={roles}
                        accounts={accounts}
                        exchanges={exchanges}
                        instruments={instruments}
                        getPreRiskDesc={getPreRiskDesc}
                        getFunding={getBuyFundingHandler}
                        orderSize={values?.orderSize}
                    />
                </FormikForm.Item>
            )}

            {asset && withSell && (
                <FormikForm.Item
                    {...createTestProps(EAddTaskTabSelectors.SellInstrumentsForm)}
                    className={cnInstrumentGroup}
                    label={
                        <div className={cnInstrumentGroupLabel}>
                            <span>Sell Instruments</span>
                            <span>
                                <OnlyTradingInstrumentsSwitch />
                            </span>
                        </div>
                    }
                    /**
                     * HACK: The '_field' suffix is crucial here.
                     * We prevent Formik from attempting to render errors directly from the object,
                     * which can lead to rendering issues and crashes
                     */
                    name="sellInstruments_field"
                >
                    <FormikFullInstrumentsSelector
                        key={values.type}
                        name="sellInstruments"
                        style={{ width: '100%' }}
                        assets={assets}
                        asset={asset}
                        roles={roles}
                        accounts={accounts}
                        exchanges={exchanges}
                        instruments={instruments}
                        getPreRiskDesc={getPreRiskDesc}
                        getFunding={getSellFundingHandler}
                        orderSize={values?.orderSize}
                    />
                </FormikForm.Item>
            )}

            <Row gutter={8}>
                <Col span={8}>
                    <FormikForm.Item
                        {...createTestProps(EAddTaskTabSelectors.OrderAmountLabel)}
                        label={`Order Amount${
                            isEmpty(values.assetName) ? '' : `, ${values.assetName}`
                        }`}
                        name="orderSize"
                    >
                        <FormikInputNumber
                            {...createTestProps(EAddTaskTabSelectors.OrderAmountInput)}
                            style={{ width: '100%' }}
                            name="orderSize"
                            min={0}
                        />
                        {orderAmountConvertRate}
                    </FormikForm.Item>
                </Col>
                {isBuySell && (
                    <Col span={8}>
                        <FormikForm.Item label="Max Premium" name="maxPremium">
                            <InputGroup compact style={{ display: 'flex' }}>
                                <FormikInputNumber
                                    {...createTestProps(EAddTaskTabSelectors.MaxPremiumInput)}
                                    style={{
                                        width: 'auto',
                                        flexGrow: 1,
                                    }}
                                    name="maxPremium"
                                    step={0.1}
                                />
                                <FakeInput
                                    value="%"
                                    style={{
                                        textOverflow: 'unset',
                                    }}
                                />
                            </InputGroup>
                        </FormikForm.Item>
                    </Col>
                )}
                <Col span={8}>
                    <FormikForm.Item label="Aggression" name="aggression">
                        <InputGroup compact style={{ display: 'flex' }}>
                            <FormikInputNumber
                                {...createTestProps(EAddTaskTabSelectors.AggressionInput)}
                                style={{
                                    width: 'auto',
                                    flexGrow: 1,
                                    // Overridden by InputGroup styles
                                    display: 'inline-flex',
                                }}
                                name="aggression"
                                step={0.1}
                            />
                            <FakeInput value="%" style={{ textOverflow: 'unset' }} />
                        </InputGroup>
                    </FormikForm.Item>
                </Col>
            </Row>
            {!isBuySell && (
                <Row gutter={8}>
                    <Col span={8}>
                        <FormikForm.Item label="Currency Type" name="currencyType">
                            <FormikSelect
                                {...createTestProps(EAddTaskTabSelectors.CurrencyType)}
                                style={{ width: '100%' }}
                                name="currencyType"
                                options={currencyTypeOptions}
                            />
                        </FormikForm.Item>
                    </Col>
                    <Col span={8}>
                        <FormikForm.Item
                            {...createTestProps(EAddTaskTabSelectors.MaxPriceLabel)}
                            label={
                                <MinMaxLabel
                                    type={values.type}
                                    currency={currencyLabel}
                                    convertRateUSD={convertRateUSD}
                                    priceLimit={values.priceLimit}
                                    onResetValue={cbSetPriceLimit}
                                />
                            }
                            name="priceLimit"
                        >
                            <FormikInputNumber
                                {...createTestProps(EAddTaskTabSelectors.MaxPriceInput)}
                                style={{ width: '100%' }}
                                name="priceLimit"
                                min={0}
                            />
                        </FormikForm.Item>
                    </Col>
                </Row>
            )}

            <FormikForm.Item name="submit">
                <Row gutter={16}>
                    <Col flex="auto">
                        <Button
                            {...createTestProps(EAddTaskTabSelectors.AddTaskFormButton)}
                            style={{ width: '100%' }}
                            htmlType="submit"
                            type="primary"
                            loading={isValidating || isSubmitting}
                            disabled={
                                !enabled ||
                                Object.keys(errors).length !== 0 ||
                                isValidating ||
                                isSubmitting
                            }
                        >
                            Add Task
                        </Button>
                    </Col>
                    <Col flex="48px">
                        <Button
                            {...createTestProps(EAddTaskTabSelectors.ResetFormButton)}
                            onClick={resetFormData}
                            icon={<UndoOutlined />}
                            title="Reset form"
                        />
                    </Col>
                </Row>
            </FormikForm.Item>
        </FormikForm>
    );
}

type TMinMaxLabelProps = {
    type: ESide;
    priceLimit: number | undefined;
    convertRateUSD: number | undefined;
    currency: string | undefined;
    onResetValue: () => void;
};
function MinMaxLabel(props: TMinMaxLabelProps): ReactElement {
    const { type, currency, priceLimit, convertRateUSD, onResetValue } = props;

    const label = (type === ESide.Buy ? 'Max' : 'Min') + ` Price${currency ? `, ${currency}` : ''}`;

    return (
        <>
            {label}
            {!isNil(convertRateUSD) && convertRateUSD !== priceLimit && (
                <Button
                    {...createTestProps(EAddTaskTabSelectors.ResetPriceToCurrent)}
                    type="text"
                    size="small"
                    icon={<UndoOutlined />}
                    title="Reset price to current"
                    onClick={onResetValue}
                />
            )}
        </>
    );
}

function useOrderAmountValidator(instruments: TInstrument[]): ConditionBuilder<NumberSchema> {
    return useFunction(
        (
            assetName: string,
            buyInstruments: THerodotusTaskFormDataInstrument[],
            sellInstruments: THerodotusTaskFormDataInstrument[],
            schema: NumberSchema,
            orderSizeField: undefined | { value: number },
        ) => {
            if (isNil(orderSizeField) || isNil(orderSizeField.value) || isNil(assetName)) {
                return schema.nullable(true);
            }

            const filteredInstruments = [...buyInstruments, ...sellInstruments]
                .map((formInstrument) =>
                    getInstrumentByName(instruments, formInstrument.exchange, formInstrument.name),
                )
                .filter((instrument) => !isNil(instrument)) as TInstrument[];

            const instrumentsAmountInStepAmounts = filteredInstruments.map((instrument) => {
                assert(!isNil(instrument.amountNotation.multiplier), 'Multiplier is not defined');
                assert(!isNil(instrument.stepQty.value), 'StepQty is not defined');

                return new BigDecimal(instrument.amountNotation.multiplier).multiply(
                    new BigDecimal(instrument.stepQty.value),
                );
            });

            if (instrumentsAmountInStepAmounts.length === 0) {
                return schema;
            }

            const orderSizeBigDecimal = new BigDecimal(orderSizeField.value);

            const amountInStepAmounts = instrumentsAmountInStepAmounts.find(
                (amountInStepAmounts) => {
                    const lots = orderSizeBigDecimal.divide(
                        amountInStepAmounts,
                        getPrecisionBigDecimal(orderSizeBigDecimal) +
                            getMainSizeBigDecimal(amountInStepAmounts) +
                            1,
                    );

                    return lots.compareTo(lots.floor()) !== 0;
                },
            );

            if (isNil(amountInStepAmounts)) {
                return schema;
            }

            return schema.test({
                test: () => false,
                message: `Order Amount is not a multiple of the amount step: ${formatUnitsLots(
                    amountInStepAmounts,
                    undefined,
                    assetName,
                )}`,
            });
        },
    ) as unknown as ConditionBuilder<NumberSchema>;
}
