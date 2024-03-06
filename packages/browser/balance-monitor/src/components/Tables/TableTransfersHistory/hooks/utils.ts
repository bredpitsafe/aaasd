import { ETransferKind } from '@frontend/common/src/types/domain/balanceMonitor/defs';

export function getCreateModeDisplayText(createMode: ETransferKind): string {
    switch (createMode) {
        case ETransferKind.Manual:
            return 'Manual';

        case ETransferKind.SuggestAccepted:
            return 'Suggest Accepted';

        case ETransferKind.SuggestEdited:
            return 'Suggest Edited';

        case ETransferKind.Auto:
            return 'Auto';

        default:
            return createMode ?? '';
    }
}
