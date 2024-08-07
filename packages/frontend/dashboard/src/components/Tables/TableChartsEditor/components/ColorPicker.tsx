import { FundFilled } from '@ant-design/icons';
import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import { ColorPicker } from '@frontend/common/src/components/ColorPicker';
import { Dropdown } from '@frontend/common/src/components/Dropdown';
import { getHexCssColor, hex2string } from '@frontend/common/src/utils/colors';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { useSyncState } from '@frontend/common/src/utils/React/useSyncState';
import { isNumber } from 'lodash-es';
import type { ReactElement } from 'react';
import { useMemo } from 'react';

type TTableColorPickerProps = {
    id: TSeriesId;
    color: number | string;
    onChange?: (color: string) => void;
    onSelectColor?: (color: string) => void;
};

export function TableColorPicker({
    id,
    color,
    onChange,
    onSelectColor,
}: TTableColorPickerProps): ReactElement {
    const [open, setOpen] = useSyncState(false, [id]);
    const [currentColor, setCurrentColor] = useSyncState(color, [id, color]);

    const displayColor = useMemo(
        () => (isNumber(currentColor) ? hex2string(currentColor) : currentColor),
        [currentColor],
    );

    const handleOpenChange = useFunction((opened: boolean) => {
        setOpen(opened);
        if (!opened) {
            onSelectColor?.(displayColor);
        }
    });
    const handleSetOpen = useFunction(() => setOpen(true));
    const handlePickColor = useFunction((color: string) => {
        setCurrentColor(color);
        onChange?.(color);
    });

    return (
        <Dropdown
            trigger={['click']}
            open={open}
            onOpenChange={handleOpenChange}
            overlay={<ColorPicker color={displayColor} onChange={handlePickColor} />}
        >
            <FundFilled
                style={{
                    fontSize: 22,
                    color: getHexCssColor(currentColor),
                }}
                onClick={handleSetOpen}
            />
        </Dropdown>
    );
}
