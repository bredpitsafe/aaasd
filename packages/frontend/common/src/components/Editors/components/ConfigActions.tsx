import type { TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import type { ButtonProps } from 'antd/lib/button/button';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { memo, useMemo } from 'react';

import {
    ConfigTabProps,
    EConfigTabSelectors,
} from '../../../../e2e/selectors/trading-servers-manager/components/config-tab/config.tab.selectors';
import type { TConfigRevisionLookup } from '../../../modules/actions/config/ModuleFetchConfigRevisions';
import type { TWithChildren } from '../../../types/components';
import { useFunction } from '../../../utils/React/useFunction';
import { Button } from '../../Button';
import { Select } from '../../Select';
import { Space } from '../../Space';
import { Switch } from '../../Switch';
import { EConfigEditorMode } from '../types';
import { cnButtons, cnRevisionSelector } from './ConfigActions.css';

export type TConfigActionsProps = TWithChildren;

export function ConfigActions(props: TConfigActionsProps): ReactElement {
    return <Space className={cnButtons}>{props.children}</Space>;
}

export function ActionButton(props: { title: string } & ButtonProps): ReactElement {
    return <Button {...props}>{props.title}</Button>;
}

export function ApplyButton(props: { title?: string } & ButtonProps): ReactElement {
    return (
        <ActionButton
            {...props}
            title={props.title || 'Apply'}
            type="primary"
            {...ConfigTabProps[EConfigTabSelectors.ApplyButton]}
        />
    );
}

export function DiscardButton(props: { title?: string } & ButtonProps): ReactElement {
    return (
        <ActionButton
            {...props}
            title={props.title || 'Discard'}
            {...ConfigTabProps[EConfigTabSelectors.DiscardButton]}
        />
    );
}

export const RevisionSelector = (props: {
    currentDigest?: string;
    revisions?: TConfigRevisionLookup[];
    loading?: boolean;
    onChange: (digest: string, label: string) => void;
    timeZone: TimeZone;
}) => {
    const options = useMemo(() => {
        return props.revisions?.map((rev) => ({
            key: rev.fingerprint,
            value: rev.digest,
            label: `${toDayjsWithTimezone(rev.platformTime, props.timeZone).format(
                EDateTimeFormats.DateTime,
            )} ${rev.user}`,
        }));
    }, [props.revisions, props.timeZone]);

    const cbChange = useFunction((value, option) => {
        props.onChange(value, option.label);
    });

    const selectedDigest = useMemo(
        () =>
            isNil(props.revisions) ||
            isNil(props.currentDigest) ||
            props.revisions.some(({ digest }) => digest === props.currentDigest)
                ? props.currentDigest
                : undefined,
        [props.currentDigest, props.revisions],
    );

    return (
        <Select
            {...ConfigTabProps[EConfigTabSelectors.RevisionsSelector]}
            className={cnRevisionSelector}
            value={selectedDigest}
            onChange={cbChange}
            options={options}
            showSearch
            loading={props.loading}
            optionFilterProp="label"
            placeholder={props.loading ? 'Loading revisions...' : 'Select revision'}
            dropdownMatchSelectWidth={false}
        />
    );
};

export const DiffSwitcher = memo(
    (props: { defaultValue: EConfigEditorMode; onChange: (value: EConfigEditorMode) => void }) => {
        const handleChange = useFunction((checked: boolean) => {
            props.onChange(checked ? EConfigEditorMode.diff : EConfigEditorMode.single);
        });

        return (
            <Switch
                {...ConfigTabProps[EConfigTabSelectors.DiffButton]}
                checkedChildren="Diff"
                unCheckedChildren="Diff"
                defaultChecked={props.defaultValue === EConfigEditorMode.diff}
                onChange={handleChange}
            />
        );
    },
);
