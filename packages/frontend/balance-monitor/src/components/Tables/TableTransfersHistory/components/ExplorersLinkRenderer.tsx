import type { ICellRendererParams } from '@frontend/ag-grid';
import type { TTransferHistoryItem } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { uniq } from 'lodash-es';
import type { ForwardedRef } from 'react';
import { forwardRef, memo } from 'react';

import { cnLinkArray } from '../view.css';

export const ExplorersLinkRenderer = memo(
    forwardRef(
        (
            { value: explorers }: ICellRendererParams<TTransferHistoryItem['txExplorers']>,
            ref: ForwardedRef<HTMLElement>,
        ) => {
            const explorersElements = uniq(explorers).map((explorerUrl) => {
                const parts = explorerUrl.split('/');
                const explorerName = parts[2] ?? parts.at(-1) ?? explorerUrl;

                const fixedUrl = explorerUrl.includes('://')
                    ? explorerUrl
                    : `https://${explorerUrl}`;

                return (
                    <a
                        key={explorerUrl}
                        target="_blank"
                        className={cnLinkArray}
                        href={fixedUrl}
                        rel="noreferrer"
                        title={explorerUrl}
                    >
                        [{explorerName}]
                    </a>
                );
            });

            return <div ref={ref as ForwardedRef<HTMLDivElement>}>{explorersElements}</div>;
        },
    ),
);
