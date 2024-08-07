import { TimeseriesCharter } from '@frontend/charter/src';
import type { TTimeseriesCharterOptions } from '@frontend/charter/src/types';
import { logger } from '@frontend/common/src/utils/Tracing';
import JSON5 from 'json5';
import { isNil } from 'lodash-es';
import { memo, useCallback, useLayoutEffect, useRef } from 'react';

import { getTextFromBlob } from './utils';

export const CharterTab = memo(() => {
    const chartRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const chartViewerRef = useRef<TimeseriesCharter>();

    const setup = useCallback((state: TTimeseriesCharterOptions) => {
        if (isNil(chartRef.current)) {
            return;
        }

        logger.info('Initial state', { state: structuredClone(state) });

        chartRef.current.style.width = `${state.screenWidth ?? 800}px`;
        chartRef.current.style.height = `${state.screenHeight ?? 600}px`;

        chartViewerRef.current = new TimeseriesCharter({
            ...state,
            enableDebug: true,
            enableClosestPoints: true,
            screenWidth: chartRef.current.offsetWidth,
            screenHeight: chartRef.current.offsetHeight,
        });

        chartRef.current.append(chartViewerRef.current.getView());

        logger.info('Timeseries Charter', { chartViewer: chartViewerRef.current });
    }, []);

    const destroy = useCallback(() => {
        if (isNil(chartViewerRef.current)) {
            return;
        }

        chartRef.current?.removeChild(chartViewerRef.current.getView());
        chartViewerRef.current.destroy();
    }, [chartRef]);

    const onUpload = useCallback(
        async (e: Event): Promise<void> => {
            const target = e.target as HTMLInputElement;

            if (target.files && target.files?.length > 0) {
                const text = await getTextFromBlob(target.files[0]);
                const json = JSON5.parse(text);

                destroy();
                setup(json);
            }
        },
        [destroy, setup],
    );

    useLayoutEffect(() => {
        const input = inputRef.current;

        if (isNil(input)) {
            return;
        }

        input.addEventListener('change', onUpload);

        return () => input.removeEventListener('change', onUpload);
    }, [onUpload]);

    return (
        <div>
            <div ref={chartRef} style={{ marginBottom: '8px' }}></div>

            <input ref={inputRef} type="file" accept=".json" />
        </div>
    );
});
