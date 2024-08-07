import type { Nil } from '@common/types';
import type {
    IDoesFilterPassParams,
    IFilter,
    IFilterParams,
    IFloatingFilterParams,
    IFloatingFilterParent,
    IFloatingFilterReactComp,
} from '@frontend/ag-grid';
import type { TAgGridRadioFilter } from '@frontend/ag-grid/src/types';
import type { RadioChangeEvent } from 'antd';
import cn from 'classnames';
import { isNil } from 'lodash-es';
import type { ChangeEventHandler } from 'react';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useMountedState, useUnmount } from 'react-use';

import type { TWithClassname } from '../../../../types/components';
import { useFunction } from '../../../../utils/React/useFunction';
import { Radio, RadioGroup } from '../../../Radio';
import { Space } from '../../../Space';
import { cnContainer, cnSelect } from './ColumnRadioFilter.css';

const NONE = {
    label: 'None',
    value: 'NONE' + Math.random(),
};
type TItem<T extends undefined | string | number> = {
    label: string;
    value: T;
};

export function createColumnRadioFilter<TData, TValue extends undefined | string | number>(
    initialProps: TWithClassname & {
        getValue: (params: IDoesFilterPassParams<TData>) => TValue;
        options: TItem<TValue>[];
        withNone?: boolean;
    },
) {
    const options = initialProps.withNone ? [NONE, ...initialProps.options] : initialProps.options;

    return forwardRef((props: IFilterParams<TData>, ref) => {
        const { filterChangedCallback } = props;

        const isMounted = useRef(true);
        const [value, setValue] = useState<undefined | TValue>(undefined);
        const handleChangeValue = useFunction((event: RadioChangeEvent) => {
            if (event.target.value === NONE.value) {
                setValue(undefined);
            } else {
                setValue(event.target.value);
            }
        });

        useUnmount(() => {
            isMounted.current = false;
        });

        // expose AG Grid Filter Lifecycle callbacks
        useImperativeHandle(
            ref,
            (): IFilter => {
                return {
                    isFilterActive: () => value !== undefined,

                    doesFilterPass(params: IDoesFilterPassParams<TData>) {
                        return value === initialProps.getValue(params);
                    },

                    getModel(): null | TAgGridRadioFilter<TValue> {
                        return value !== undefined
                            ? {
                                  filterType: 'Radio',
                                  value,
                              }
                            : null;
                    },

                    setModel(model: Nil | TAgGridRadioFilter<TValue>) {
                        if (isNil(model)) {
                            setValue(undefined);
                        } else if (model.filterType === 'Radio' && isMounted.current === true) {
                            setValue(model.value);
                        }
                    },
                };
            },
            [isMounted, value],
        );

        useEffect(() => {
            filterChangedCallback();
        }, [filterChangedCallback, value]);

        return (
            <RadioGroup
                className={cn(initialProps.className, cnContainer)}
                size="small"
                onChange={handleChangeValue}
                value={value ?? NONE.value}
            >
                <Space direction="vertical">
                    {options.map(({ label, value }, index) => {
                        return (
                            <Radio key={index} value={value}>
                                {label}
                            </Radio>
                        );
                    })}
                </Space>
            </RadioGroup>
        );
    });
}

export function createColumnRadioFloatingFilter<TData, TValue extends undefined | string | number>(
    initialProps: TWithClassname & {
        options: TItem<TValue>[];
        withNone?: boolean;
    },
) {
    const options = initialProps.withNone ? [NONE, ...initialProps.options] : initialProps.options;

    return forwardRef<
        IFloatingFilterReactComp,
        IFloatingFilterParams<IFloatingFilterParent & IFilter, TData>
    >((props, ref) => {
        const isMounted = useMountedState();
        const [value, setValue] = useState<undefined | TValue>(undefined);

        // expose AG Grid Filter Lifecycle callbacks
        useImperativeHandle(ref, () => {
            return {
                onParentModelChanged(parentModel: TAgGridRadioFilter<TValue>) {
                    if (isNil(parentModel)) {
                        setValue(undefined);
                    } else if (parentModel.filterType === 'Radio' && isMounted()) {
                        setValue(parentModel.value);
                    }
                },
            };
        });

        const handleChange: ChangeEventHandler<HTMLSelectElement> = useFunction((event) => {
            const value = event.target.value as undefined | TValue;

            if (value === NONE.value) {
                // Remove the filter
                setValue(undefined);
                props.parentFilterInstance((instance) => {
                    instance.setModel({
                        filterType: 'Radio',
                        value: undefined,
                    } as TAgGridRadioFilter<TValue>);
                });
                return;
            }

            setValue(value);
            props.parentFilterInstance((instance) => {
                instance.setModel({ filterType: 'Radio', value } as TAgGridRadioFilter<TValue>);
            });
        });

        return (
            <select className={cnSelect} value={value ?? NONE.value} onChange={handleChange}>
                {options.map(({ label, value }, index) => {
                    return (
                        <option key={index} value={value}>
                            {label}
                        </option>
                    );
                })}
            </select>
        );
    });
}
