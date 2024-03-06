import { ClearOutlined } from '@ant-design/icons';
import {
    EFiltersModalProps,
    EFiltersModalSelectors,
} from '@frontend/common/e2e/selectors/filters.modal.selectors';
import { Button } from '@frontend/common/src/components/Button';
import { Divider } from '@frontend/common/src/components/Divider';
import { FormikForm, FormikInput } from '@frontend/common/src/components/Formik';
import { FormikSelect } from '@frontend/common/src/components/Formik/components/FormikSelect';
import type { TWithLiveUpdates } from '@frontend/common/src/components/hooks/useLiveUpdates';
import { Space } from '@frontend/common/src/components/Space';
import { TableLabelLastUpdate } from '@frontend/common/src/components/TableLabel/LastUpdate';
import { TableLabelFiller } from '@frontend/common/src/components/TableLabel/TableLabelFiller';
import { TableLabels } from '@frontend/common/src/components/TableLabel/TableLabels';
import { Tabs, TabsProps } from '@frontend/common/src/components/Tabs';
import type { TAsset } from '@frontend/common/src/types/domain/asset';
import type { TExchange } from '@frontend/common/src/types/domain/exchange';
import type { TInstrument } from '@frontend/common/src/types/domain/instrument';
import type { TStrategyName } from '@frontend/common/src/types/domain/ownTrades';
import type { TTradingStatsFilter } from '@frontend/common/src/types/domain/tradingStats';
import type { TimeZone } from '@frontend/common/src/types/time';
import { ReactElement, ReactNode, useMemo } from 'react';

import { getTabName } from './utils';
import { cnDivider, cnForm, cnSubmitButtons } from './view.css';

export type TradingStatsFilterViewProps = Pick<TWithLiveUpdates, 'updateTime'> & {
    values: TTradingStatsFilter;
    setFieldValue: (field: string, value: unknown) => void;
    assets?: TAsset[];
    instruments?: TInstrument[];
    exchanges?: TExchange[];
    strategies?: TStrategyName[];
    isSubmitting: boolean;
    dirty: boolean;
    resetForm: () => void;
    submitForm: () => void;
    children?: ReactNode;
    timeZone: TimeZone;
};

export function CommonFilterView(props: TradingStatsFilterViewProps): ReactElement {
    const {
        assets,
        instruments,
        exchanges,
        strategies,
        values,
        isSubmitting,
        resetForm,
        dirty,
        children,
        updateTime,
    } = props;

    const assetsOptions = useMemo(
        () =>
            assets?.map((asset) => (
                <FormikSelect.Option key={asset.id} value={asset.id}>
                    {asset.name}
                </FormikSelect.Option>
            )),
        [assets],
    );

    const instrumentsOptions = useMemo(
        () =>
            instruments?.map((instrument) => (
                <FormikSelect.Option key={instrument.id} value={instrument.id}>
                    {instrument.id} | {instrument.exchange} | {instrument.name}
                </FormikSelect.Option>
            )),
        [instruments],
    );

    const exchangesOptions = useMemo(
        () =>
            exchanges?.map((exchange) => (
                <FormikSelect.Option key={exchange.name} value={exchange.name}>
                    {exchange.name}
                </FormikSelect.Option>
            )),
        [exchanges],
    );

    const strategiesOptions = useMemo(
        () =>
            strategies?.map((name) => {
                const title = name || 'No strategy';
                return (
                    <FormikSelect.Option key={title} value={name}>
                        {title}
                    </FormikSelect.Option>
                );
            }),
        [strategies],
    );

    const includeTabName = getTabName(
        'Include',
        values.baseAssetsInclude,
        values.quoteAssetsInclude,
        values.anyAssetsInclude,
        values.instrumentsInclude,
        values.exchangesInclude,
        values.strategiesInclude,
    );

    const excludeTabName = getTabName(
        'Exclude',
        values.baseAssetsExclude,
        values.quoteAssetsExclude,
        values.anyAssetsExclude,
        values.instrumentsExclude,
        values.exchangesExclude,
        values.strategiesExclude,
    );

    const items: TabsProps['items'] = [
        {
            key: 'include',
            label: includeTabName,
            children: (
                <>
                    <FormikForm.Item name="strategiesInclude" label="Strategies">
                        <FormikSelect
                            {...EFiltersModalProps[
                                EFiltersModalSelectors.StrategiesIncludeSelector
                            ]}
                            name="strategiesInclude"
                            mode="multiple"
                        >
                            {strategiesOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="baseAssetsInclude" label="Base Assets">
                        <FormikSelect
                            {...EFiltersModalProps[
                                EFiltersModalSelectors.BaseAssetsIncludeSelector
                            ]}
                            name="baseAssetsInclude"
                            mode="multiple"
                        >
                            {assetsOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="quoteAssetsInclude" label="Quote Assets">
                        <FormikSelect
                            {...EFiltersModalProps[
                                EFiltersModalSelectors.QuoteAssetsIncludeSelector
                            ]}
                            name="quoteAssetsInclude"
                            mode="multiple"
                        >
                            {assetsOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="anyAssetsInclude" label="Any Assets">
                        <FormikSelect
                            {...EFiltersModalProps[EFiltersModalSelectors.AnyAssetsIncludeSelector]}
                            name="anyAssetsInclude"
                            mode="multiple"
                        >
                            {assetsOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="exchangesInclude" label="Exchanges">
                        <FormikSelect
                            {...EFiltersModalProps[EFiltersModalSelectors.ExchangesIncludeSelector]}
                            name="exchangesInclude"
                            mode="multiple"
                        >
                            {exchangesOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="instrumentsInclude" label="Instruments">
                        <FormikSelect
                            {...EFiltersModalProps[
                                EFiltersModalSelectors.InstrumentsIncludeSelector
                            ]}
                            name="instrumentsInclude"
                            mode="multiple"
                            exactSearchMatch={false}
                        >
                            {instrumentsOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                </>
            ),
        },
        {
            key: 'exclude',
            label: excludeTabName,
            children: (
                <>
                    <FormikForm.Item name="strategiesExclude" label="Strategies">
                        <FormikSelect
                            {...EFiltersModalProps[
                                EFiltersModalSelectors.StrategiesExcludeSelector
                            ]}
                            name="strategiesExclude"
                            mode="multiple"
                        >
                            {strategiesOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="baseAssetsExclude" label="Base Assets">
                        <FormikSelect
                            {...EFiltersModalProps[
                                EFiltersModalSelectors.BaseAssetsExcludeSelector
                            ]}
                            name="baseAssetsExclude"
                            mode="multiple"
                        >
                            {assetsOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="quoteAssetsExclude" label="Quote Assets">
                        <FormikSelect
                            {...EFiltersModalProps[
                                EFiltersModalSelectors.QuoteAssetsExcludeSelector
                            ]}
                            name="quoteAssetsExclude"
                            mode="multiple"
                        >
                            {assetsOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="anyAssetsExclude" label="Any Assets">
                        <FormikSelect
                            {...EFiltersModalProps[EFiltersModalSelectors.AnyAssetsExcludeSelector]}
                            name="anyAssetsExclude"
                            mode="multiple"
                        >
                            {assetsOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="exchangesExclude" label="Exchanges">
                        <FormikSelect
                            {...EFiltersModalProps[EFiltersModalSelectors.ExchangesExcludeSelector]}
                            name="exchangesExclude"
                            mode="multiple"
                        >
                            {exchangesOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                    <FormikForm.Item name="instrumentsExclude" label="Instruments">
                        <FormikSelect
                            {...EFiltersModalProps[
                                EFiltersModalSelectors.InstrumentsExcludeSelector
                            ]}
                            name="instrumentsExclude"
                            mode="multiple"
                            exactSearchMatch={false}
                        >
                            {instrumentsOptions}
                        </FormikSelect>
                    </FormikForm.Item>
                </>
            ),
        },
    ];

    return (
        <FormikForm layout="vertical" className={cnForm}>
            <TableLabels>
                <TableLabelLastUpdate time={updateTime} timeZone={props.timeZone} />
                <TableLabelFiller />
                <FormikForm.Item name="submit" className={cnSubmitButtons}>
                    <Space.Compact block>
                        <Button
                            {...EFiltersModalProps[EFiltersModalSelectors.ApplyButton]}
                            type="primary"
                            htmlType="submit"
                            disabled={!dirty || isSubmitting}
                            loading={isSubmitting}
                        >
                            Apply
                        </Button>
                        <Button
                            {...EFiltersModalProps[EFiltersModalSelectors.ResetButton]}
                            icon={<ClearOutlined />}
                            title="Clear form"
                            disabled={isSubmitting}
                            onClick={resetForm}
                        />
                    </Space.Compact>
                </FormikForm.Item>
            </TableLabels>
            <Divider className={cnDivider} />
            {children}
            <FormikForm.Item name="backtestingId" label="Backtesting ID">
                <FormikInput
                    {...EFiltersModalProps[EFiltersModalSelectors.BacktestingIdInput]}
                    name="backtestingId"
                    type="number"
                />
            </FormikForm.Item>
            <Tabs type="card" defaultActiveKey="include" items={items} />
        </FormikForm>
    );
}
