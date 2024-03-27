import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TCoinId } from '@frontend/common/src/types/domain/balanceMonitor/defs';
import { memo } from 'react';

import { COIN_ICONS } from './coinIcons';

export const CoinIcon = memo(({ className, coin }: TWithClassname & { coin: TCoinId }) => {
    const iconName = coin.toUpperCase();
    const src = iconName in COIN_ICONS ? COIN_ICONS[iconName] : undefined;

    return src === undefined ? null : <img className={className} alt={coin} src={src} />;
});
