import {
    CheckOutlined,
    ClearOutlined,
    CloseOutlined,
    MenuOutlined,
    WarningOutlined,
} from '@ant-design/icons';
import type { TInstrumentRevision } from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { ISO, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { lowerCaseComparator } from '@common/utils/src/comporators/lowerCaseComparator.ts';
import type { IHeaderGroupParams, IHeaderParams } from '@frontend/ag-grid';
import { Button } from '@frontend/common/src/components/Button';
import { Dropdown } from '@frontend/common/src/components/Dropdown';
import { List } from '@frontend/common/src/components/List';
import { Space } from '@frontend/common/src/components/Space';
import { useFunction } from '@frontend/common/src/utils/React/useFunction.ts';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { semanticHash } from '@frontend/common/src/utils/semanticHash.ts';
import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useMemo, useState } from 'react';
import { useEvent } from 'react-use';

import type { TRevisionList } from '../../types/instruments.ts';
import type { TPropertyRow } from './defs.ts';
import {
    cnInstrumentHeaderContainer,
    cnInstrumentHeaderIcon,
    cnInstrumentHeaderName,
    cnInstrumentRevisionsIcon,
    cnInstrumentRevisionsSelector,
    cnRevisionAction,
    cnRevisionActionListItem,
    cnRevisionDirty,
    cnRevisionItem,
    cnRevisionItemSelected,
    cnRevisionList,
    cnRevisionSelectorDropdown,
} from './view.css.ts';

const DEFAULT_LATEST_SELECTION = ['' as const];

export const RevisionSelectorHeader = memo(
    ({
        displayName,
        removeInstrument,
        revisions,
        timeZone,
        setInstrumentRevisions,
        selectedRevisions,
        ...props
    }: (IHeaderParams<TPropertyRow> | IHeaderGroupParams<TPropertyRow>) & {
        removeInstrument: VoidFunction;
        setInstrumentRevisions: (revisions: TRevisionList) => void;
        revisions: TInstrumentRevision[] | undefined;
        selectedRevisions: (ISO | undefined)[];
        timeZone: TimeZone;
    }) => {
        const [menuRef, setMenuRef] = useState<HTMLDivElement | null>(null);

        const cbContextMenu = useFunction((e) => {
            if (
                isNil(menuRef) ||
                !('enableMenu' in props) ||
                !('showColumnMenu' in props) ||
                !props.enableMenu ||
                isNil(props.showColumnMenu)
            ) {
                return;
            }

            e.preventDefault();
            props.showColumnMenu(menuRef);
        });
        useEvent('contextmenu', cbContextMenu, menuRef);

        const strictSelectedRevisions = useMemo(
            () =>
                isEmpty(selectedRevisions)
                    ? DEFAULT_LATEST_SELECTION
                    : selectedRevisions.map((platformTime) =>
                          isNil(platformTime) ? '' : platformTime,
                      ),
            [selectedRevisions],
        );

        const [normalizedSelectedRevisions, setSelectedRevisions] = useSyncState(
            strictSelectedRevisions,
            [strictSelectedRevisions],
        );

        const toggle = useFunction((key: string) => {
            const hasKey = normalizedSelectedRevisions.includes(key as '' | ISO);

            if (hasKey) {
                setSelectedRevisions(
                    normalizedSelectedRevisions.filter((platformTime) => platformTime !== key),
                );
            } else {
                setSelectedRevisions([...normalizedSelectedRevisions, key as '' | ISO]);
            }
        });

        const options = useMemo(
            () =>
                [
                    {
                        label: 'Latest',
                        key: '',
                        selected: normalizedSelectedRevisions.includes(''),
                    },
                ].concat(
                    revisions?.map(({ platformTime }) => ({
                        label: toDayjsWithTimezone(platformTime as ISO, timeZone).format(
                            EDateTimeFormats.DateTime,
                        ),
                        key: platformTime,
                        selected: normalizedSelectedRevisions.includes(platformTime as ISO),
                    })) ?? [],
                ),
            [revisions, timeZone, normalizedSelectedRevisions],
        );

        const hasDirtyChanges = useMemo(
            () =>
                semanticHash.get(
                    { items: strictSelectedRevisions },
                    { items: semanticHash.withSorter(lowerCaseComparator) },
                ) !==
                semanticHash.get(
                    { items: normalizedSelectedRevisions },
                    { items: semanticHash.withSorter(lowerCaseComparator) },
                ),
            [normalizedSelectedRevisions, strictSelectedRevisions],
        );

        const dropdownRender = useFunction(() => {
            return (
                <List
                    className={cnRevisionList}
                    dataSource={options}
                    renderItem={(item) => (
                        <List.Item
                            className={cn(cnRevisionItem, {
                                [cnRevisionItemSelected]: item.selected,
                            })}
                            actions={
                                item.selected ? [<CheckOutlined key={'checked'} />] : undefined
                            }
                            onClick={() => toggle(item.key)}
                        >
                            {item?.label}
                        </List.Item>
                    )}
                >
                    <List.Item className={cnRevisionActionListItem}>
                        <Space.Compact block size="small">
                            <Button
                                className={cnRevisionAction}
                                type="primary"
                                size="small"
                                disabled={
                                    normalizedSelectedRevisions.length === 0 || !hasDirtyChanges
                                }
                                onClick={() =>
                                    setInstrumentRevisions(
                                        normalizedSelectedRevisions
                                            .map((revision) =>
                                                isEmpty(revision) ? undefined : revision,
                                            )
                                            .sort((a, b) =>
                                                isNil(a) ? 1 : isNil(b) ? -1 : a.localeCompare(b),
                                            ) as TRevisionList,
                                    )
                                }
                            >
                                Apply
                            </Button>
                            <Button
                                className={cnRevisionAction}
                                size="small"
                                icon={<ClearOutlined />}
                                disabled={!hasDirtyChanges}
                                onClick={() => setSelectedRevisions(strictSelectedRevisions)}
                                title="Reset filter"
                            />
                        </Space.Compact>
                    </List.Item>
                </List>
            );
        });

        const [opened, setOpened] = useState(false);

        return (
            <div className={cnInstrumentHeaderContainer} role="presentation" ref={setMenuRef}>
                <Dropdown
                    trigger={['click']}
                    overlayClassName={cnRevisionSelectorDropdown}
                    dropdownRender={dropdownRender}
                    onOpenChange={setOpened}
                >
                    <span className={cn(cnInstrumentHeaderName, cnInstrumentRevisionsSelector)}>
                        {displayName}
                        <MenuOutlined className={cnInstrumentRevisionsIcon} />
                        {hasDirtyChanges && !opened && (
                            <WarningOutlined
                                className={cnRevisionDirty}
                                title="Revisions list is not applyed"
                            />
                        )}
                    </span>
                </Dropdown>
                <CloseOutlined className={cnInstrumentHeaderIcon} onClick={removeInstrument} />
            </div>
        );
    },
);
