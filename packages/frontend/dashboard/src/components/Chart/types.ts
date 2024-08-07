import type { Assign, Milliseconds, Someseconds, TTimeZoneInfo } from '@common/types';
import type { TSeriesId } from '@frontend/charter/lib/Parts/def';
import type { IPlugin } from '@frontend/charter/src/plugins/Plugin';
import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import type { TXmlToJsonScheme } from '@frontend/common/src/utils/CustomView/defs';

import type {
    TChartPanelChartProps,
    TChartPanelLevelProps,
    TPanel,
    TPanelSettings,
} from '../../types/panel';
import type { TDashboardRouteParams } from '../../types/router';
import type { TMilliseconds2Someseconds, TSomeseconds2Milliseconds } from './utils';

export type TChartProps = Assign<
    TChartPanelChartProps,
    {
        visible: boolean;
    }
>;

export type TProps = TWithClassname &
    TWithStyle & {
        panel: TPanel;
        settings: TPanelSettings;
        charts: TChartPanelChartProps[];
        levels?: TChartPanelLevelProps[];
        schemes?: TXmlToJsonScheme[];
        currentTime?: Milliseconds;
        backtestingId?: number;
        timeNowIncrements: Record<TSeriesId, Someseconds>;

        onChangeSettings: (settings: TPanelSettings) => void;
        onCopyLink: (position: Exclude<TDashboardRouteParams['position'], undefined>) => void;
        onWebGLContextLost?: VoidFunction;

        plugins?: IPlugin[];

        somesecondsToMilliseconds: TSomeseconds2Milliseconds;
        millisecondsToSomeseconds: TMilliseconds2Someseconds;

        timeZoneInfo: TTimeZoneInfo;
        showPseudoHorizontalCrosshair: boolean;
        showPseudoHorizontalCrosshairTooltips: boolean;
    };

export enum EChartWorldWidthPreset {
    Minute = '1m',
    FifteenMinutes = '15m',
    ThirtyMinutes = '30m',
    Hour = '1h',
    Day = '1D',
    Month = '1M',
}
