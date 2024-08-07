import { Collapse } from 'antd';
import type { ReactElement } from 'react';

import { createTestProps } from '../../../e2e';
import { EProductLogsTabSelectors } from '../../../e2e/selectors/trading-servers-manager/components/product-logs-tab/product-logs.tab.selectors';
import type { TTableProductLogsProps } from '../Tables/TableProductLogs';
import { TableProductLogs } from '../Tables/TableProductLogs';
import type { TFiltersViewProps } from './Components/FiltersView';
import { FiltersView } from './Components/FiltersView';
import { cnFilter, cnRoot, cnTable } from './view.css';

export type TProductLogsViewProps = {
    localStorageKey: string;
} & TTableProductLogsProps &
    TFiltersViewProps;

export function ProductLogsView(props: TProductLogsViewProps): ReactElement {
    return (
        <div className={cnRoot} {...createTestProps(EProductLogsTabSelectors.ServerFilterButton)}>
            <Collapse className={cnFilter}>
                <Collapse.Panel key="1" header={'Server Filter'}>
                    <FiltersView
                        key={props.localStorageKey}
                        query={props.query}
                        timeZone={props.timeZone}
                        onChange={props.onChange}
                    />
                </Collapse.Panel>
            </Collapse>
            <TableProductLogs
                key={props.localStorageKey}
                className={cnTable}
                exportFilename={props.exportFilename}
                updateTime={props.updateTime}
                getRows={props.getRows}
                refreshInfiniteCacheTrigger$={props.refreshInfiniteCacheTrigger$}
                maxBlocks={props.maxBlocks}
                blockSize={props.blockSize}
                timeZone={props.timeZone}
                onTouchTop={props.onTouchTop}
                onUnTouchTop={props.onUnTouchTop}
            />
        </div>
    );
}
