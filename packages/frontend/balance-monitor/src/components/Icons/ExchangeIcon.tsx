import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TExchangeId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { memo } from 'react';

import { EXCHANGE_ICONS } from './exchangeIcons';

export const ExchangeIcon = memo(
    ({ className, exchangeName }: TWithClassname & { exchangeName: TExchangeId }) => {
        const iconName = exchangeName.toUpperCase();
        const src = iconName in EXCHANGE_ICONS ? EXCHANGE_ICONS[iconName] : undefined;

        return src === undefined ? null : (
            <img className={className} alt={exchangeName} src={src} />
        );
    },
);
