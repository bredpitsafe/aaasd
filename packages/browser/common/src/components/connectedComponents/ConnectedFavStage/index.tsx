import { StarFilled, StarOutlined } from '@ant-design/icons';
import cn from 'classnames';
import { memo } from 'react';

import { TSettingsStoreName } from '../../../actors/Settings/db';
import { useFavoriteStages } from '../../../hooks/useFavoriteStages';
import { TWithClassname } from '../../../types/components';
import { TSocketName } from '../../../types/domain/sockets';
import { useFunction } from '../../../utils/React/useFunction';
import { Button } from '../../Button';
import { cnFavoriteButton } from './styles.css';

type TProps = TWithClassname & {
    stageName: TSocketName;
    settingsStoreName: TSettingsStoreName;
};

export const ConnectedFavStage = memo(({ stageName, settingsStoreName, className }: TProps) => {
    const [favoriteStages, setFavoriteStage] = useFavoriteStages(settingsStoreName);
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
        >
            {isFavorite ? <StarFilled /> : <StarOutlined />}
        </Button>
    );
});
