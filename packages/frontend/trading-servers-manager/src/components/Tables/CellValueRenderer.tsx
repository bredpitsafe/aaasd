import type { Nil, TimeZone } from '@common/types';
import { EDateTimeFormats } from '@common/types';
import { toDayjsWithTimezone } from '@common/utils';
import { assertNever } from '@common/utils/src/assert.ts';
import type { ICellRendererParams } from '@frontend/ag-grid/src/ag-grid-community.ts';
import { Tooltip } from '@frontend/common/src/components/Tooltip';
import type { TWithClassname } from '@frontend/common/src/types/components.ts';
import { isEmpty, isNil } from 'lodash-es';
import { memo } from 'react';

import type { EDefaultLayoutComponents } from '../../layouts/default.tsx';
import { WidgetInstrumentApprovalStatusRenderer } from '../../widgets/WidgetInstrumentApprovalStatusRenderer.tsx';
import { WidgetRevisionsDateRenderer } from '../../widgets/WidgetRevisionsDateRenderer.tsx';
import type { TEditablePropertyCell, TPropertyCell } from './defs.ts';
import { EDataKind } from './defs.ts';
import { DynamicDataStatus } from './DynamicDataStatus.tsx';
import { DynamicDataStepPrice } from './DynamicDataStepPrice.tsx';
import { cnErrorDescription, cnFullCellSize } from './view.css.ts';

export const CellValueRenderer = memo(
    (
        params: ICellRendererParams<TPropertyCell | TEditablePropertyCell> &
            TWithClassname & {
                timeZone: TimeZone;
                revisionsTab?:
                    | EDefaultLayoutComponents.InstrumentRevisions
                    | EDefaultLayoutComponents.ProviderInstrumentRevisions;
                skipActions?: boolean;
            },
    ) => {
        const { value, timeZone, revisionsTab, skipActions } = params;

        if (
            !isNil(value) &&
            'errors' in value &&
            !isEmpty(value.errors) &&
            Array.isArray(value.errors)
        ) {
            return (
                <Tooltip
                    placement="left"
                    title={
                        <>
                            {value.errors.map((error, index) => (
                                <p key={index} className={cnErrorDescription}>
                                    {error}
                                </p>
                            ))}
                        </>
                    }
                    destroyTooltipOnHide
                    zIndex={1000}
                >
                    <div className={cnFullCellSize}>
                        <ValueRenderer
                            value={value}
                            timeZone={timeZone}
                            revisionsTab={revisionsTab}
                            skipActions={skipActions}
                        />
                    </div>
                </Tooltip>
            );
        }

        return (
            <ValueRenderer
                value={value}
                timeZone={timeZone}
                revisionsTab={revisionsTab}
                skipActions={skipActions}
            />
        );
    },
);

const ValueRenderer = memo(
    ({
        value,
        timeZone,
        skipActions,
        revisionsTab,
    }: {
        value: TPropertyCell | TEditablePropertyCell | Nil;
        timeZone: TimeZone;
        revisionsTab?:
            | EDefaultLayoutComponents.InstrumentRevisions
            | EDefaultLayoutComponents.ProviderInstrumentRevisions;
        skipActions?: boolean;
    }) => {
        if (isNil(value) || !('kind' in value) || isNil(value.kind)) {
            return null;
        }

        const { kind, data } = value;

        switch (kind) {
            case EDataKind.Number:
            case EDataKind.String:
                return <>{data}</>;
            case EDataKind.Select:
                return isNil(value.params.valueFormatter) || isNil(data) ? (
                    <>{data}</>
                ) : (
                    <>{value.params.valueFormatter(data)}</>
                );
            case EDataKind.InstrumentApprovalStatus:
                return (
                    <WidgetInstrumentApprovalStatusRenderer
                        instrument={data}
                        skipActions={skipActions}
                    />
                );
            case EDataKind.DynamicDataStatus:
                return <DynamicDataStatus status={data} />;
            case EDataKind.StepPrice:
                return <DynamicDataStepPrice priceStepRules={data} />;
            case EDataKind.DateTime:
                return (
                    <>
                        {!isNil(data) &&
                            toDayjsWithTimezone(data, timeZone).format(EDateTimeFormats.DateTime)}
                    </>
                );
            case EDataKind.RevisionDateTime:
                return isNil(revisionsTab) ? (
                    <>
                        {!isNil(data) &&
                            toDayjsWithTimezone(data.date, timeZone).format(
                                EDateTimeFormats.DateTime,
                            )}
                    </>
                ) : (
                    <WidgetRevisionsDateRenderer
                        instrument={data.instrument}
                        date={data.date}
                        timeZone={timeZone}
                        tab={revisionsTab}
                    />
                );
            default:
                assertNever(kind);
        }
    },
);
