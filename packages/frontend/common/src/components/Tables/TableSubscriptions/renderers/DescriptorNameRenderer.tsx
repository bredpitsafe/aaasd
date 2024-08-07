import type { Nil } from '@common/types';
import type { ValueGetterParams } from '@frontend/ag-grid/src/ag-grid-community.ts';
import { type ICellRendererParams } from '@frontend/ag-grid/src/ag-grid-community.ts';
import { AgValue } from '@frontend/ag-grid/src/AgValue.ts';
import { isNil, isObject, omit } from 'lodash-es';
import { memo, useMemo } from 'react';

import type { TSocketSubscriptionState } from '../../../../modules/subscriptionsState/module.ts';
import { getWSQueryTerminalUrl } from '../../../../utils/urlBuilders.ts';
import { UrlRenderer } from '../../../AgTable/renderers/UrlRenderer.tsx';

type TValue = AgValue<
    TSocketSubscriptionState['descriptor'],
    Pick<TSocketSubscriptionState, 'params' | 'descriptor'>
>;

export const descriptorNameCellValueGetter = ({
    data,
}: ValueGetterParams<TSocketSubscriptionState>): Nil | TValue => {
    return data && AgValue.create(data.descriptor.name, data, ['params', 'descriptor']);
};

export const DescriptorNameCellRenderer = memo(({ value }: ICellRendererParams<TValue>) => {
    const url = useMemo(() => {
        if (isNil(value)) {
            return;
        }

        // TODO: data.params.target can be either TSocketUrl or TSocketStruct, but we don't see it in the type here.
        const target = isObject(value.data.params?.target)
            ? value.data.params.target.name
            : value.data.params?.target;

        if (isNil(target)) {
            return;
        }

        const params = omit(value.data.params, 'target');

        return getWSQueryTerminalUrl(target, params);
    }, [value]);

    if (isNil(value)) {
        return <>—</>;
    }

    return <UrlRenderer url={url} text={value.data.descriptor.name} />;
});
