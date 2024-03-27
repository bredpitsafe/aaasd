import { PlusSquareOutlined } from '@ant-design/icons';
import { createTestProps } from '@frontend/common/e2e';
import { ETablesModalSelectors } from '@frontend/common/e2e/selectors/trading-servers-manager/tables.modal.selectors';
import { Button, ButtonProps } from '@frontend/common/src/components/Button';
import { EComponentConfigType } from '@frontend/common/src/types/domain/component';
import { MouseEventHandler, ReactElement, useCallback } from 'react';

type TAddComponentTabButtonProps = {
    configType: EComponentConfigType;
    onClick: (configType: EComponentConfigType) => void;
} & Omit<ButtonProps, 'onClick'>;

export function AddComponentTabButton(props: TAddComponentTabButtonProps): ReactElement {
    const { configType, onClick } = props;

    const cbClick: MouseEventHandler<HTMLElement> = useCallback(
        (e) => {
            e.stopPropagation();
            onClick(configType);
        },
        [configType, onClick],
    );

    return (
        <Button
            {...createTestProps(ETablesModalSelectors.AddComponent)}
            type="text"
            size="small"
            icon={<PlusSquareOutlined />}
            title={`Create new ${props.configType}`}
            onClick={cbClick}
        />
    );
}
