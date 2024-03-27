import type { TWithClassname, TWithStyle } from '@frontend/common/src/types/components';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TPoint } from '@frontend/common/src/types/shape';
import type { TXmlToJsonScheme } from '@frontend/common/src/utils/CustomView/defs';
import cn from 'classnames';
import { ForwardedRef, forwardRef, ReactElement, useRef } from 'react';
import { useHoverDirty } from 'react-use';

import type { TPanelId } from '../../types/panel';
import type { TChartLegendClickHandler } from '../ChartLegends/view';
import { ChartPointsPopup, TClosestPointData } from '../ChartPointsPopup/view';
import { useHotKeyActionData, useRegisterHotKeyAction } from '../HotKeysActions';
import { ConnectedChartCanvas } from './components/ConnectedChartCanvas';
import { ConnectedChartLegends } from './components/ConnectedChartLegends';
import type { TChartProps } from './types';
import { cnCanvas, cnRoot } from './view.css';

const CHART_SHOW_POPUP_COMMAND = 'CHART_SHOW_POPUP';
const CHART_SHOW_POPUP_HOTKEY = { code: 'Space' };

function togglePopupVisibility(showPopup: boolean | undefined) {
    return !(showPopup ?? true);
}

type TChartViewProps = TWithClassname &
    TWithStyle & {
        view: HTMLElement;
        panelId: TPanelId;
        url: TSocketURL;
        backtestingId?: number;
        showLegends: boolean;
        charts: TChartProps[];
        schemes?: TXmlToJsonScheme[];
        onClickLegend: TChartLegendClickHandler;
        getChartClosestPoints: () => TClosestPointData[];
        getMouseCoords: () => TPoint;
    };
export const ChartView = forwardRef(
    (props: TChartViewProps, ref: ForwardedRef<HTMLDivElement>): ReactElement => {
        const canvasRef = useRef<HTMLDivElement>(null);
        const chartHovered = useHoverDirty(canvasRef);

        useRegisterHotKeyAction(
            CHART_SHOW_POPUP_COMMAND,
            CHART_SHOW_POPUP_HOTKEY,
            togglePopupVisibility,
        );

        const showTooltip = useHotKeyActionData<boolean>(CHART_SHOW_POPUP_COMMAND, true);

        return (
            <div ref={ref} className={cn(props.className, cnRoot)} style={props.style}>
                {props.showLegends && (
                    <ConnectedChartLegends
                        url={props.url}
                        backtestingId={props.backtestingId}
                        panelId={props.panelId}
                        charts={props.charts}
                        schemes={props.schemes}
                        onClick={props.onClickLegend}
                    />
                )}
                <ConnectedChartCanvas ref={canvasRef} className={cnCanvas} view={props.view} />
                {showTooltip && chartHovered && (
                    <ChartPointsPopup
                        chartRef={canvasRef}
                        charts={props.charts}
                        getClosestPoints={props.getChartClosestPoints}
                        getMouseCoords={props.getMouseCoords}
                    />
                )}
            </div>
        );
    },
);
