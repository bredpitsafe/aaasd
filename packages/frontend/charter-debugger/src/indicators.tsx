/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    blue,
    cyan,
    geekblue,
    gold,
    green,
    grey,
    lime,
    magenta,
    orange,
    purple,
    red,
    volcano,
    yellow,
} from '@ant-design/colors';
import { getNowNanoseconds } from '@common/utils';
import type { TPart } from '@frontend/charter/lib/Parts/def';
import { getAbsPointTime, getAbsPointValue } from '@frontend/charter/lib/Parts/utils/point';
import type { TContextRef } from '@frontend/common/src/di';
import type { TIndicator } from '@frontend/common/src/modules/actions/indicators/defs';
import { createFetchHandlers } from '@frontend/common/src/modules/communicationHandlers/createFetchHandlers';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';
import { Promql } from '@frontend/common/src/utils/Promql';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { loggerCharter } from '@frontend/common/src/utils/Tracing/Children/Charter.ts';
import { getValidSocketUrl } from '@frontend/common/src/utils/url';
import { chunk, isNil } from 'lodash-es';
import { memo, useMemo, useRef, useState } from 'react';

import { publishIndicatorsHandle } from './publishIndicatorsHandle.ts';
import { getTextFromBlob, SOCKETS } from './utils';

const inputTypes = [
    ['User input', 'raw'],
    ['Snapshot file', 'file'],
];
const servers = Object.entries(SOCKETS).sort(([a], [b]) => a.localeCompare(b));

const publisher = 'CharterDebugger';

export const IndicatorsTab = memo(({ ctx }: { ctx: TContextRef }) => {
    const [inputType, setInputType] = useState(inputTypes[0][1]);
    const [userInputText, setUserInputText] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [fileIndicatorPrefix, setFileIndicatorPrefix] = useState('');
    const [requestBodyPreview, setRequestBodyPreview] = useState('');
    const [requestBody, setRequestBody] = useState<TIndicator[]>([]);
    const [server, setServer] = useState<string>(servers[0][1]);
    const url = useMemo(() => getValidSocketUrl(server as TSocketURL), [server]);
    const [publishedIndicators, setPublishedIndicators] = useState('');
    const handlers = useMemo(() => createFetchHandlers(ctx), [ctx]);

    const generateServerRequest = useFunction(async () => {
        if (inputType === 'raw') {
            const indicators = JSON.parse(userInputText) as unknown as TIndicator[];

            const now = getNowNanoseconds();

            const bodyIndicators = (Array.isArray(indicators) ? indicators : [indicators]).map(
                ({ name, value, platformTime }) => {
                    return {
                        name,
                        value,
                        platformTime: platformTime ?? now,
                        publisher,
                    } as TIndicator;
                },
            );

            setRequestBodyPreview(JSON.stringify(bodyIndicators, undefined, 2));
            setRequestBody(bodyIndicators);

            return;
        }

        const files = (fileInputRef?.current as HTMLInputElement | null)?.files;

        if (!isNil(files) && files.length > 0) {
            const text = await getTextFromBlob(files[0]);
            const json = JSON.parse(text);
            const serverTimeIncrement = json.serverTimeIncrement as number;

            const charts = Object.keys(json.__states__)
                .filter((key) => key.startsWith('PartsTextureStore_'))
                .map((key) => {
                    const query = key.substring('PartsTextureStore_'.length);
                    return {
                        key,
                        indicator:
                            fileIndicatorPrefix +
                                Promql.tryParseQuery(query as TPromqlQuery)?.labels?.name ?? query,
                    };
                });

            const indicators = [];
            const platformTimeForIndicator = new Set<string>();

            for (const { key, indicator } of charts) {
                const parts = Object.values(json.__states__[key]?.parts?.map ?? {})
                    .map((part) => (part as any)?.value || { size: 0, interval: 0 })
                    .sort(({ interval: a }, { interval: b }) => a - b) as TPart[];

                for (const part of parts) {
                    for (let index = 0; index < part.size; index++) {
                        let platformTime = getAbsPointTime(part, index) + serverTimeIncrement;
                        const value = getAbsPointValue(part, index) ?? null;

                        let indexPlatformTime = 0;
                        let key = `${indicator}_${platformTime}`;
                        while (platformTimeForIndicator.has(key)) {
                            indexPlatformTime++;
                            platformTime += indexPlatformTime * 1000;
                            key = `${indicator}_${platformTime}`;
                        }
                        platformTimeForIndicator.add(key);

                        indicators.push({
                            name: indicator,
                            platformTime,
                            value,
                            publisher,
                        });
                    }
                }
            }

            setRequestBodyPreview(JSON.stringify(indicators, undefined, 2));
            setRequestBody(indicators as unknown as TIndicator[]);
        }

        //const
    });

    const postServer = useFunction(async () => {
        const colors = [
            red[4],
            volcano[4],
            gold[4],
            orange[4],
            yellow[4],
            lime[4],
            green[4],
            cyan[4],
            blue[4],
            geekblue[4],
            purple[4],
            magenta[4],
            grey[4],
        ];

        const indicatorsSet = new Set<string>();
        requestBody.forEach(({ name }) => indicatorsSet.add(name));
        Promise.all(
            chunk(requestBody, 50000).map((chunk) =>
                publishIndicatorsHandle(handlers.update, url, publisher, chunk),
            ),
        ).then(
            () =>
                setPublishedIndicators(`<panel>
  <type>Charts</type>
  <settings>
    <url>${url}</url>
    <server_time_unit>nanosecond</server_time_unit>
  </settings>
  <charts>
    ${Array.from(indicatorsSet.keys()).map(
        (indicator, index) => `<chart>
      <striving>true</striving>
      <label>${indicator}</label>
      <color>${colors[index % colors.length]}</color>
      <query>indicators{name='${indicator}'}</query>
      <type>stairs</type>
      <opacity>1</opacity>
      <width>1</width>
      <label_format>%s: %.6g</label_format>
    </chart>`,
    ).join(`
    `)}
  </charts>
</panel>
`),
            (error) => {
                loggerCharter.error(error);
                alert('Error received');
            },
        );
    });

    return (
        <div>
            <div
                style={{
                    border: '1px solid black',
                    width: '600px',
                    padding: '10px',
                }}
            >
                <h3>1) Provide indicators</h3>
                {inputTypes.map(([name, key]) => (
                    <label key={key}>
                        <input
                            type="radio"
                            name="input-type"
                            value={key}
                            checked={key === inputType}
                            onChange={({ target: { value } }) => setInputType(value)}
                        />
                        {name}
                    </label>
                ))}
                <div>
                    {inputType === 'raw' && (
                        <textarea
                            value={userInputText}
                            style={{
                                width: '100%',
                                height: '200px',
                                margin: '10px 0',
                            }}
                            onChange={({ target: { value } }) => setUserInputText(value)}
                        ></textarea>
                    )}
                    {inputType === 'file' && (
                        <>
                            <input style={{ margin: '10px 0' }} type="file" ref={fileInputRef} />
                            <label style={{ display: 'block' }}>
                                Indicator prefix:
                                <input
                                    type="text"
                                    style={{ margin: '10px 0 10px 5px' }}
                                    value={fileIndicatorPrefix}
                                    onChange={({ target: { value } }) =>
                                        setFileIndicatorPrefix(value)
                                    }
                                />
                            </label>
                        </>
                    )}
                </div>

                <button type="button" onClick={generateServerRequest}>
                    Generate
                </button>
            </div>

            <div
                style={{
                    border: '1px solid black',
                    width: '600px',
                    padding: '10px',
                }}
            >
                <h3>2) Preview</h3>
                <textarea
                    readOnly
                    value={requestBodyPreview}
                    style={{
                        width: '100%',
                        height: '200px',
                        margin: '10px 0',
                    }}
                ></textarea>

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

                <button
                    type="button"
                    onClick={postServer}
                    disabled={requestBody.length === 0 && !!server}
                >
                    Publish
                </button>
            </div>

            <div
                style={{
                    border: '1px solid black',
                    width: '600px',
                    padding: '10px',
                }}
            >
                <h3>3) Charts config</h3>
                <textarea
                    readOnly
                    value={publishedIndicators}
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
