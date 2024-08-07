import { SettingsSlider } from '@frontend/common/src/components/Settings/Slider';
import { memo } from 'react';

import { useLegendFontSize } from './hooks/useLegendFontSize';

export const FontSize = memo(() => {
    const [fontSize, changeFontSize, clearFontSize, loading] = useLegendFontSize();

    return (
        <SettingsSlider
            label="Legend font size"
            value={fontSize}
            onChange={changeFontSize}
            onReset={clearFontSize}
            disabled={loading}
        />
    );
});
