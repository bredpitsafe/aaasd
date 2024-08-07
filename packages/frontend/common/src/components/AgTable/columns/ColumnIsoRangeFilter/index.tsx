import type { ISO, Milliseconds, Nil, TimeZone } from '@common/types';
import { compareDates } from '@common/utils';
import type { IDoesFilterPassParams, IFilter, IFilterParams } from '@frontend/ag-grid';
import type { Dayjs } from 'dayjs';
import dayjs from 'dayjs';
import { isNil } from 'lodash-es';
import { forwardRef, useEffect, useImperativeHandle, useMemo, useState } from 'react';

import { useFunction } from '../../../../utils/React/useFunction';
import { DatePicker } from '../../../DatePicker';
import { Space } from '../../../Space';

export type TColumnIsoRangeDateFilterProps<TData> = {
    timeZone: TimeZone;
    defaultSince?: undefined | ISO;
    defaultTill?: undefined | ISO;
    getIso: (params: IDoesFilterPassParams<TData>) => ISO;
};

export function createColumnIsoRangeFilter<TData>(props: TColumnIsoRangeDateFilterProps<TData>) {
    const { timeZone, getIso, defaultTill, defaultSince } = props;

    return forwardRef((props: IFilterParams<TData>, ref) => {
        const { filterChangedCallback } = props;
        const [since, setSince] = useState<undefined | Dayjs>(
            useMemo(() => (defaultSince ? dayjs(defaultSince) : undefined), []),
        );
        const [till, setTill] = useState<undefined | Dayjs>(
            useMemo(() => (defaultTill ? dayjs(defaultTill) : undefined), []),
        );

        const isActive = useFunction(() => {
            return since !== undefined || till !== undefined;
        });

        // expose AG Grid Filter Lifecycle callbacks
        useImperativeHandle(
            ref,
            (): IFilter => {
                return {
                    isFilterActive: isActive,

                    doesFilterPass(params: IDoesFilterPassParams<TData>) {
                        const rowIso = getIso(params);
                        if (
                            since !== undefined &&
                            compareDates(rowIso, since.valueOf() as Milliseconds) < 0
                        )
                            return false;
                        if (
                            till !== undefined &&
                            compareDates(rowIso, till.valueOf() as Milliseconds) > 0
                        )
                            return false;
                        return true;
                    },

                    getModel() {
                        return isActive()
                            ? {
                                  since: since?.toISOString(),
                                  till: till?.toISOString(),
                              }
                            : null;
                    },

                    setModel(model) {
                        if (model) {
                            model.since && setSince(dayjs(model.since));
                            model.till && setTill(dayjs(model.till));
                        } else {
                            setSince(undefined);
                            setTill(undefined);
                        }
                    },
                };
            },
            [isActive, since, till],
        );

        useEffect(() => {
            filterChangedCallback();
        }, [filterChangedCallback, since, till]);

        const onChangeSince = useFunction((value: null | Dayjs) => {
            if (value?.valueOf() === since?.valueOf()) return;
            setSince(value ?? undefined);
        });
        const onChangeTill = useFunction((value: null | Dayjs) => {
            if (value?.valueOf() === till?.valueOf()) return;
            setTill(value ?? undefined);
        });

        return (
            <Space size="small" direction="vertical" align="center">
                <Space>
                    <span>Since</span>
                    <DatePicker
                        size="small"
                        showTime
                        timeZone={timeZone}
                        value={since}
                        onChange={onChangeSince}
                    />
                </Space>
                <Space>
                    <span>Till</span>
                    <DatePicker
                        size="small"
                        showTime
                        timeZone={timeZone}
                        value={till}
                        onChange={onChangeTill}
                    />
                </Space>
            </Space>
        );
    });
}

export function createColumnIsoRangeFilterData<TData>(
    getIso: (params: IDoesFilterPassParams<TData>) => ISO,
) {
    return class ColumnIsoRangeFilterData {
        private gui = document.createElement('div');
        private since: undefined | ISO;
        private till: undefined | ISO;

        init() {
            //
        }

        getGui() {
            return this.gui;
        }

        doesFilterPass(params: IDoesFilterPassParams<TData>) {
            const rowIso = getIso(params);

            if (this.since !== undefined && compareDates(rowIso, this.since) < 0) {
                return false;
            }

            if (this.till !== undefined && compareDates(rowIso, this.till) > 0) {
                return false;
            }

            return true;
        }

        isFilterActive() {
            return this.since !== undefined || this.till !== undefined;
        }

        getModel() {
            return this.isFilterActive()
                ? {
                      since: this.since,
                      till: this.till,
                  }
                : null;
        }

        setModel(model: Nil | { since: undefined | ISO; till: undefined | ISO }) {
            this.since = isNil(model) ? undefined : model.since;
            this.till = isNil(model) ? undefined : model.till;
        }
    };
}
