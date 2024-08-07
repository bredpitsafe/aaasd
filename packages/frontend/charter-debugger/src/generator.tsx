import { blue } from '@ant-design/colors';
import type { TContextRef } from '@frontend/common/src/di';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import { createFetchHandlers } from '@frontend/common/src/modules/communicationHandlers/createFetchHandlers';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import { getValidSocketUrl } from '@frontend/common/src/utils/url';
import { isNil } from 'lodash-es';
import { memo, useLayoutEffect, useMemo, useState } from 'react';

import { publishIndicatorsHandle } from './publishIndicatorsHandle.ts';
import { SOCKETS } from './utils';

const servers = Object.entries(SOCKETS).sort(([a], [b]) => a.localeCompare(b));

const publisher = 'CharterDebugger';

const nowDate = new Date();
const nowISO = nowDate.toISOString();
const generators: [string, (indicatorName: string) => TIndicator][] = [
    [
        'TimeIncrement',
        (indicatorName) =>
            ({
                name: indicatorName,
                value: nowDate.valueOf(),
                platformTime: nowISO,
                publisher,
            }) as TIndicator,
    ],
    [
        'TimeIncrement seconds',
        (indicatorName) =>
            ({
                name: indicatorName,
                value: nowDate.valueOf() / 1000,
                platformTime: nowISO,
                publisher,
            }) as TIndicator,
    ],
    [
        'Random 1000',
        (indicatorName) =>
            ({
                name: indicatorName,
                value: Math.round(Math.random() * 1000),
                platformTime: nowISO,
                publisher,
            }) as TIndicator,
    ],
    [
        'Constant 100',
        (indicatorName) =>
            ({
                name: indicatorName,
                value: 100,
                platformTime: nowISO,
                publisher,
            }) as TIndicator,
    ],
    [
        'Constant 200',
        (indicatorName) =>
            ({
                name: indicatorName,
                value: 200,
                platformTime: nowISO,
                publisher,
            }) as TIndicator,
    ],
];

export const GeneratorTab = memo(({ ctx }: { ctx: TContextRef }) => {
    const [server, setServer] = useState<string>(servers[0][1]);
    const [indicatorName, setIndicatorName] = useState<string>('');
    const [generatorAlgorithm, setGeneratorAlgorithm] = useState<string>('Random 1000');
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const url = useMemo(() => getValidSocketUrl(server as TSocketURL), [server]);
    const handlers = useMemo(() => createFetchHandlers(ctx), [ctx]);

    const [indicatorsCount, setIndicatorsCount] = useState(1);

    useLayoutEffect(() => {
        if (!isGenerating) {
            return;
        }

        const interval = setInterval(() => {
            const generator = generators.find(([name]) => name === generatorAlgorithm);

            if (isNil(generator)) {
                return;
            }

            const indicators = new Array(indicatorsCount || 1)
                .fill(null)
                .map((_, index, { length }) =>
                    generator[1](
                        length > 1
                            ? `${indicatorName}|${index
                                  .toString()
                                  .padStart((length - 1).toString().length, '0')}`
                            : indicatorName,
                    ),
                );

            publishIndicatorsHandle(handlers.update, url, publisher, indicators);
        }, 500);

        return () => clearInterval(interval);
    }, [isGenerating, indicatorsCount, indicatorName, generatorAlgorithm, handlers.update, url]);

    return (
        <div>
            <div
                style={{
                    border: '1px solid black',
                    width: '600px',
                    padding: '10px',
                }}
            >
                <h3>1) Settings</h3>

                <label style={{ display: 'block', marginBottom: '10px' }}>
                    Indicator name:
                    <input
                        style={{ marginLeft: '10px' }}
                        type="text"
                        value={indicatorName}
                        onChange={({ target: { value } }) => setIndicatorName(value)}
                    />
                </label>

                <select
                    style={{ marginRight: '10px' }}
                    value={server}
                    onChange={({ target: { value } }) => setServer(value)}
                >
                    {servers.map(([key, value]) => (
                        <option key={value} value={value}>
                            {key}
                        </option>
                    ))}
                </select>

                <select
                    style={{ marginRight: '10px' }}
                    value={generatorAlgorithm}
                    onChange={({ target: { value } }) => setGeneratorAlgorithm(value)}
                >
                    {generators.map(([key]) => (
                        <option key={key} value={key}>
                            {key}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    pattern="\d*"
                    maxLength={4}
                    style={{ width: '50px' }}
                    value={indicatorsCount}
                    onChange={({ target: { value } }) =>
                        setIndicatorsCount(value ? parseInt(value) : 0)
                    }
                />

                <button
                    type="button"
                    onClick={() => setIsGenerating(!isGenerating)}
                    disabled={!indicatorName || !generatorAlgorithm || !server}
                >
                    {isGenerating ? 'Stop' : 'Start'}
                </button>
            </div>

            <div
                style={{
                    border: '1px solid black',
                    width: '600px',
                    padding: '10px',
                }}
            >
                <h3>2) Charts config</h3>
                <textarea
                    readOnly
                    value={getDefaultPanel(url, indicatorName)}
                    style={{
                        width: '100%',
                        height: '200px',
                        margin: '10px 0',
                    }}
                ></textarea>
            </div>
        </div>
    );
});

function getDefaultPanel(url: string, indicatorName: string) {
    return `<panel>
  <type>Charts</type>
  <settings>
    <url>${url}</url>
    <min_zoom>2.78e-13</min_zoom>
    <max_y>6000</max_y>
    <server_time_unit>nanosecond</server_time_unit>
    <server_time_increment>1609459200000000000</server_time_increment>
    <follow_mode>permament</follow_mode>
    <closest_points>true</closest_points>
    <time_zone>${nowDate.getTimezoneOffset() * 60 * 1e9}</time_zone>
    <min_width>1000</min_width>
    <max_width>94608000000000000</max_width>
  </settings>
  <charts>
    <chart>
      <striving>true</striving>
      <label>${indicatorName}</label>
      <color>${blue[4]}</color>
      <query>indicators{name='${indicatorName}'}</query>
      <type>stairs</type>
      <opacity>1</opacity>
      <width>1</width>
      <label_format>%s: %.6g</label_format>
    </chart>
  </charts>
</panel>`;
}
