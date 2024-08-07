import type {
    TAssetApprovalStatus,
    TIndexApprovalStatus,
    TInstrumentApprovalStatus,
} from '@backend/bff/src/modules/instruments/schemas/defs.ts';
import type { TWithClassname } from '@frontend/common/src/types/components.ts';
import { statusToDisplayStatus } from '@frontend/common/src/utils/instruments/converters.ts';
import cn from 'classnames';
import { memo } from 'react';

import { cnEnumValue, cnStatusStyles } from './view.css.ts';

const ERROR_STATUSES = new Set<
    TInstrumentApprovalStatus | TAssetApprovalStatus | TIndexApprovalStatus
>([
    'INSTRUMENT_APPROVAL_STATUS_UNAPPROVED',
    'INSTRUMENT_APPROVAL_STATUS_BLOCKED',
    'ASSET_APPROVAL_STATUS_UNAPPROVED',
    'INDEX_APPROVAL_STATUS_UNAPPROVED',
]);
const SUCCESS_STATUSES = new Set<
    TInstrumentApprovalStatus | TAssetApprovalStatus | TIndexApprovalStatus
>([
    'INSTRUMENT_APPROVAL_STATUS_APPROVED',
    'ASSET_APPROVAL_STATUS_APPROVED',
    'INDEX_APPROVAL_STATUS_APPROVED',
]);

export const ApprovalStatus = memo(
    ({
        className,
        approvalStatus,
    }: TWithClassname & {
        approvalStatus: TInstrumentApprovalStatus | TAssetApprovalStatus | TIndexApprovalStatus;
    }) => {
        return (
            <span
                className={cn(
                    cnEnumValue,
                    {
                        [cnStatusStyles.error]: ERROR_STATUSES.has(approvalStatus),
                        [cnStatusStyles.succeeded]: SUCCESS_STATUSES.has(approvalStatus),
                        [cnStatusStyles.normal]:
                            !ERROR_STATUSES.has(approvalStatus) &&
                            !SUCCESS_STATUSES.has(approvalStatus),
                    },
                    className,
                )}
            >
                {statusToDisplayStatus(approvalStatus)}
            </span>
        );
    },
);
