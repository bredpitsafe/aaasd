import { StarFilled, StarOutlined } from '@ant-design/icons';
import type { EApplicationName } from '@common/types';
import cn from 'classnames';
import { memo } from 'react';

import { useFavoriteStages } from '../../../hooks/useFavoriteStages';
import type { TWithClassname } from '../../../types/components';
import type { TSocketName } from '../../../types/domain/sockets';
import { useFunction } from '../../../utils/React/useFunction';
import { Button } from '../../Button';
import { cnFavoriteButton } from './styles.css';

type TProps = TWithClassname & {
    stageName: TSocketName;
    appName: EApplicationName;
};

export const ConnectedFavStage = memo(({ appName, stageName, className }: TProps) => {
    const [favoriteStages, setFavoriteStage, loading] = useFavoriteStages(appName);
    const isFavorite = favoriteStages.has(stageName);

    const changeStatus = useFunction(() => {
        setFavoriteStage(stageName, !isFavorite);
    });

    return (
        <Button
            className={cn(cnFavoriteButton, className)}
            onClick={changeStatus}
            shape="circle"
            size="small"
            type="text"
            loading={loading}
        >
            {isFavorite ? <StarFilled /> : <StarOutlined />}
        </Button>
    );
});
