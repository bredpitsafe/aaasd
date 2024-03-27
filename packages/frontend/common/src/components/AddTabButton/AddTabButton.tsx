import { PlusOutlined } from '@ant-design/icons';
import { MenuProps } from 'antd';
import { ReactElement, useCallback, useMemo } from 'react';

import {
    EMainMenuModalSelectors,
    EMainMenuProps,
} from '../../../e2e/selectors/main-menu.modal.selectors';
import { Button } from '../Button';
import { Dropdown } from '../Dropdown';
import { TConnectedAddTabButtonProps } from './ConnectedAddTabButton';

type TAddTabButtonProps = TConnectedAddTabButtonProps & {
    components: string[];
    onClick: (e: string) => void;
};

export function AddTabButton(props: TAddTabButtonProps): ReactElement {
    const { components, onClick, ...restProps } = props;

    const cbClick = useCallback((e: { key: string }) => onClick(e.key), [onClick]);

    const menuProps: MenuProps = useMemo(
        () => ({
            onClick: cbClick,
            items: components.map((component) => ({ key: component, label: component })),
        }),
        [cbClick, components],
    );

    const disabled = components.length === 0;

    return (
        <Dropdown menu={menuProps} disabled={disabled}>
            {
                <Button
                    size="small"
                    icon={<PlusOutlined />}
                    title={
                        disabled
                            ? 'No components can be added to the current layout'
                            : 'Add components'
                    }
                    {...EMainMenuProps[EMainMenuModalSelectors.AddTabButton]}
                    disabled={disabled}
                    {...restProps}
                />
            }
        </Dropdown>
    );
}
