import type { TSocketURL } from '../../types/domain/sockets';

export const defaultUrl = 'wss://localhost/default/' as TSocketURL;

export const fullFeatureTableConfig = `
<table>
  <header>
    <column>
      <text>Header2.0</text>
      <width>100px</width>
    </column>
    <column>
      <width>200px</width>
    </column>
    <column>
      <text>Header3</text>
      <width>100px</width>
    </column>
    <column>
      <text>Header4</text>
      <width>100px</width>
    </column>
  </header>
  <row>
    <style>
      <background_color>Aquamarine</background_color>
    </style>
    <if>
      <condition>age({       ALGO|TEST_RND|01}) > 265130</condition>
      <style>
        <background_color>green</background_color>
      </style>
    </if>
    <cell>
      <text>Level 1.1</text>
    </cell>
    <cell>
      <text>Level 1.2</text>
    </cell>
    <cell>
      <text>
        <format>ALGO|TEST_RND|01 age: %g seconds</format>
        <formula>age({ALGO|TEST_RND|01})</formula>
      </text>
    </cell>
    <cell>
      <text>
        <format>Base text: %g</format>
        <formula>{ALGO|TEST_RND|01}</formula>
      </text>
      <style>
        <background_color>blue</background_color>
      </style>
      <mark>
        <style>
          <color>white</color>
        </style>
      </mark>
      <if>
        <condition>{ALGO|TEST_RND|02} > 900000</condition>
        <style>
          <background_color>red</background_color>
          <border>3px solid black</border>
          <border_radius>10px</border_radius>
        </style>
        <text>
          <format>Changed label: %g</format>
          <formula>{ALGO|TEST_RND|02}</formula>
        </text>
        <tooltip>Foo</tooltip>
        <mark>
          <style>
            <color>black</color>
            <width>30px</width>
            <height>30px</height>
          </style>
        </mark>
      </if>
    </cell>
    <row>
      <cell>
        <text>Level 2.1</text>
      </cell>
      <cell>
        <text>Level 2.2</text>
      </cell>
      <cell>
        <text>
          <format>ALGO|TEST_RND|02 age: %g seconds</format>
          <formula>age({ALGO|TEST_RND|02})</formula>
        </text>
      </cell>
      <row>
        <style>
          <background_color>Aquamarine</background_color>
        </style>
        <if>
          <condition>age({ALGO|TEST_RND|01}) > 265130</condition>
          <style>
            <background_color>green</background_color>
          </style>
        </if>
        <cell>
          <text>Some text 1</text>
        </cell>
        <cell>
          <text>Some text 2</text>
        </cell>
        <cell>
          <text>
            <format>ALGO|TEST_RND|01 age: %g seconds</format>
            <formula>age({ALGO|TEST_RND|01})</formula>
          </text>
        </cell>
        <cell>
          <text>
            <format>Base text: %g</format>
            <formula>{ALGO|TEST_RND|01}</formula>
          </text>
          <style>
            <background_color>blue</background_color>
          </style>
          <mark>
            <style>
              <color>white</color>
            </style>
          </mark>
          <if>
            <condition>{ALGO|TEST_RND|02} > 900</condition>
            <style>
              <background_color>red</background_color>
              <border>3px solid black</border>
              <border_radius>10px</border_radius>
            </style>
            <text>
              <format>Changed label: %g</format>
              <formula>{ALGO|TEST_RND|02}</formula>
            </text>
            <tooltip>Foo</tooltip>
            <mark>
              <style>
                <color>black</color>
                <width>30px</width>
                <height>30px</height>
              </style>
            </mark>
          </if>
        </cell>
        <row>
          <cell>
            <text>ROW 2: Some text 1</text>
          </cell>
          <cell>
            <text>ROW 2: Some text 2</text>
          </cell>
          <cell>
            <text>
              <format>ALGO|TEST_RND|02 age: %g seconds</format>
              <formula>age({ALGO|TEST_RND|02})</formula>
            </text>
          </cell>
        </row>
      </row>
    </row>
  </row>
</table>
`;

export const fullFeatureParsedTable = {
    table: {
        allIndicators: [
            {
                name: 'ALGO|TEST_RND|01',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|02',
                url: 'wss://localhost/default/',
            },
        ],
        indicators: [],
        parameters: {
            columns: [
                {
                    text: 'Header2.0',
                    width: 100,
                },
                {
                    width: 200,
                },
                {
                    text: 'Header3',
                    width: 100,
                },
                {
                    text: 'Header4',
                    width: 100,
                },
            ],
            maxRowColumnsCount: 6,
        },
        rows: [
            {
                rowsCells: 6,
                allIndicators: [
                    {
                        name: 'ALGO|TEST_RND|01',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|02',
                        url: 'wss://localhost/default/',
                    },
                ],
                indicators: [
                    {
                        name: 'ALGO|TEST_RND|01',
                        url: 'wss://localhost/default/',
                    },
                ],
                parameters: {
                    style: {
                        backgroundColor: 'Aquamarine',
                    },
                },
                conditions: [
                    {
                        condition: {
                            original: 'age({ALGO|TEST_RND|01}) > 265130',
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`)) > 265130",
                            ],
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|01',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            hasTimeout: true,
                        },
                        parameters: {
                            style: {
                                backgroundColor: 'green',
                            },
                        },
                    },
                ],
                rows: [
                    {
                        rowsCells: 5,
                        allIndicators: [
                            {
                                name: 'ALGO|TEST_RND|01',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|02',
                                url: 'wss://localhost/default/',
                            },
                        ],
                        indicators: [],
                        parameters: {},
                        conditions: [],
                        rows: [
                            {
                                rowsCells: 4,
                                allIndicators: [
                                    {
                                        name: 'ALGO|TEST_RND|01',
                                        url: 'wss://localhost/default/',
                                    },
                                    {
                                        name: 'ALGO|TEST_RND|02',
                                        url: 'wss://localhost/default/',
                                    },
                                ],
                                indicators: [
                                    {
                                        name: 'ALGO|TEST_RND|01',
                                        url: 'wss://localhost/default/',
                                    },
                                ],
                                parameters: {
                                    style: {
                                        backgroundColor: 'Aquamarine',
                                    },
                                },
                                conditions: [
                                    {
                                        condition: {
                                            original: 'age({ALGO|TEST_RND|01}) > 265130',
                                            constructorArguments: [
                                                'indicators',
                                                'backtestingRunId',
                                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`)) > 265130",
                                            ],
                                            indicators: [
                                                {
                                                    name: 'ALGO|TEST_RND|01',
                                                    url: 'wss://localhost/default/',
                                                },
                                            ],
                                            hasTimeout: true,
                                        },
                                        parameters: {
                                            style: {
                                                backgroundColor: 'green',
                                            },
                                        },
                                    },
                                ],
                                rows: [
                                    {
                                        allIndicators: [
                                            {
                                                name: 'ALGO|TEST_RND|02',
                                                url: 'wss://localhost/default/',
                                            },
                                        ],
                                        indicators: [],
                                        parameters: {},
                                        conditions: [],
                                        cells: [
                                            {
                                                parameters: {
                                                    text: 'ROW 2: Some text 1',
                                                },
                                                conditions: [],
                                                indicators: [],
                                                hasTimeout: false,
                                            },
                                            {
                                                parameters: {
                                                    text: 'ROW 2: Some text 2',
                                                },
                                                conditions: [],
                                                indicators: [],
                                                hasTimeout: false,
                                            },
                                            {
                                                parameters: {
                                                    text: {
                                                        format: 'ALGO|TEST_RND|02 age: %g seconds',
                                                        formula: {
                                                            original: 'age({ALGO|TEST_RND|02})',
                                                            constructorArguments: [
                                                                'indicators',
                                                                'backtestingRunId',
                                                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`))",
                                                            ],
                                                            indicators: [
                                                                {
                                                                    name: 'ALGO|TEST_RND|02',
                                                                    url: 'wss://localhost/default/',
                                                                },
                                                            ],
                                                            hasTimeout: true,
                                                        },
                                                    },
                                                },
                                                conditions: [],
                                                indicators: [
                                                    {
                                                        name: 'ALGO|TEST_RND|02',
                                                        url: 'wss://localhost/default/',
                                                    },
                                                ],
                                                hasTimeout: true,
                                            },
                                        ],
                                        hasTimeout: true,
                                        columnsCount: 3,
                                    },
                                ],
                                cells: [
                                    {
                                        parameters: {
                                            text: 'Some text 1',
                                        },
                                        conditions: [],
                                        indicators: [],
                                        hasTimeout: false,
                                    },
                                    {
                                        parameters: {
                                            text: 'Some text 2',
                                        },
                                        conditions: [],
                                        indicators: [],
                                        hasTimeout: false,
                                    },
                                    {
                                        parameters: {
                                            text: {
                                                format: 'ALGO|TEST_RND|01 age: %g seconds',
                                                formula: {
                                                    original: 'age({ALGO|TEST_RND|01})',
                                                    constructorArguments: [
                                                        'indicators',
                                                        'backtestingRunId',
                                                        "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`))",
                                                    ],
                                                    indicators: [
                                                        {
                                                            name: 'ALGO|TEST_RND|01',
                                                            url: 'wss://localhost/default/',
                                                        },
                                                    ],
                                                    hasTimeout: true,
                                                },
                                            },
                                        },
                                        conditions: [],
                                        indicators: [
                                            {
                                                name: 'ALGO|TEST_RND|01',
                                                url: 'wss://localhost/default/',
                                            },
                                        ],
                                        hasTimeout: true,
                                    },
                                    {
                                        parameters: {
                                            text: {
                                                format: 'Base text: %g',
                                                formula: {
                                                    original: '{ALGO|TEST_RND|01}',
                                                    constructorArguments: [
                                                        'indicators',
                                                        'backtestingRunId',
                                                        "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`)",
                                                    ],
                                                    indicators: [
                                                        {
                                                            name: 'ALGO|TEST_RND|01',
                                                            url: 'wss://localhost/default/',
                                                        },
                                                    ],
                                                    hasTimeout: false,
                                                },
                                            },
                                            style: {
                                                backgroundColor: 'blue',
                                            },
                                            mark: {
                                                style: {
                                                    color: 'white',
                                                },
                                            },
                                        },
                                        conditions: [
                                            {
                                                condition: {
                                                    original: '{ALGO|TEST_RND|02} > 900',
                                                    constructorArguments: [
                                                        'indicators',
                                                        'backtestingRunId',
                                                        "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`) > 900",
                                                    ],
                                                    indicators: [
                                                        {
                                                            name: 'ALGO|TEST_RND|02',
                                                            url: 'wss://localhost/default/',
                                                        },
                                                    ],
                                                    hasTimeout: false,
                                                },
                                                parameters: {
                                                    style: {
                                                        backgroundColor: 'red',
                                                        border: '3px solid black',
                                                        borderRadius: '10px',
                                                    },
                                                    text: {
                                                        format: 'Changed label: %g',
                                                        formula: {
                                                            original: '{ALGO|TEST_RND|02}',
                                                            constructorArguments: [
                                                                'indicators',
                                                                'backtestingRunId',
                                                                "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`)",
                                                            ],
                                                            indicators: [
                                                                {
                                                                    name: 'ALGO|TEST_RND|02',
                                                                    url: 'wss://localhost/default/',
                                                                },
                                                            ],
                                                            hasTimeout: false,
                                                        },
                                                    },
                                                    tooltip: 'Foo',
                                                    mark: {
                                                        style: {
                                                            color: 'black',
                                                            width: '30px',
                                                            height: '30px',
                                                        },
                                                    },
                                                },
                                            },
                                        ],
                                        indicators: [
                                            {
                                                name: 'ALGO|TEST_RND|01',
                                                url: 'wss://localhost/default/',
                                            },
                                            {
                                                name: 'ALGO|TEST_RND|02',
                                                url: 'wss://localhost/default/',
                                            },
                                        ],
                                        hasTimeout: false,
                                    },
                                ],
                                hasTimeout: true,
                                columnsCount: 4,
                            },
                        ],
                        cells: [
                            {
                                parameters: {
                                    text: 'Level 2.1',
                                },
                                conditions: [],
                                indicators: [],
                                hasTimeout: false,
                            },
                            {
                                parameters: {
                                    text: 'Level 2.2',
                                },
                                conditions: [],
                                indicators: [],
                                hasTimeout: false,
                            },
                            {
                                parameters: {
                                    text: {
                                        format: 'ALGO|TEST_RND|02 age: %g seconds',
                                        formula: {
                                            original: 'age({ALGO|TEST_RND|02})',
                                            constructorArguments: [
                                                'indicators',
                                                'backtestingRunId',
                                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`))",
                                            ],
                                            indicators: [
                                                {
                                                    name: 'ALGO|TEST_RND|02',
                                                    url: 'wss://localhost/default/',
                                                },
                                            ],
                                            hasTimeout: true,
                                        },
                                    },
                                },
                                conditions: [],
                                indicators: [
                                    {
                                        name: 'ALGO|TEST_RND|02',
                                        url: 'wss://localhost/default/',
                                    },
                                ],
                                hasTimeout: true,
                            },
                        ],
                        hasTimeout: true,
                        columnsCount: 5,
                    },
                ],
                cells: [
                    {
                        parameters: {
                            text: 'Level 1.1',
                        },
                        conditions: [],
                        indicators: [],
                        hasTimeout: false,
                    },
                    {
                        parameters: {
                            text: 'Level 1.2',
                        },
                        conditions: [],
                        indicators: [],
                        hasTimeout: false,
                    },
                    {
                        parameters: {
                            text: {
                                format: 'ALGO|TEST_RND|01 age: %g seconds',
                                formula: {
                                    original: 'age({ALGO|TEST_RND|01})',
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`))",
                                    ],
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|01',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    hasTimeout: true,
                                },
                            },
                        },
                        conditions: [],
                        indicators: [
                            {
                                name: 'ALGO|TEST_RND|01',
                                url: 'wss://localhost/default/',
                            },
                        ],
                        hasTimeout: true,
                    },
                    {
                        parameters: {
                            text: {
                                format: 'Base text: %g',
                                formula: {
                                    original: '{ALGO|TEST_RND|01}',
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`)",
                                    ],
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|01',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    hasTimeout: false,
                                },
                            },
                            style: {
                                backgroundColor: 'blue',
                            },
                            mark: {
                                style: {
                                    color: 'white',
                                },
                            },
                        },
                        conditions: [
                            {
                                condition: {
                                    original: '{ALGO|TEST_RND|02} > 900000',
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`) > 900000",
                                    ],
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|02',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    hasTimeout: false,
                                },
                                parameters: {
                                    style: {
                                        backgroundColor: 'red',
                                        border: '3px solid black',
                                        borderRadius: '10px',
                                    },
                                    text: {
                                        format: 'Changed label: %g',
                                        formula: {
                                            original: '{ALGO|TEST_RND|02}',
                                            constructorArguments: [
                                                'indicators',
                                                'backtestingRunId',
                                                "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`)",
                                            ],
                                            indicators: [
                                                {
                                                    name: 'ALGO|TEST_RND|02',
                                                    url: 'wss://localhost/default/',
                                                },
                                            ],
                                            hasTimeout: false,
                                        },
                                    },
                                    tooltip: 'Foo',
                                    mark: {
                                        style: {
                                            color: 'black',
                                            width: '30px',
                                            height: '30px',
                                        },
                                    },
                                },
                            },
                        ],
                        indicators: [
                            {
                                name: 'ALGO|TEST_RND|01',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|02',
                                url: 'wss://localhost/default/',
                            },
                        ],
                        hasTimeout: false,
                    },
                ],
                hasTimeout: true,
                columnsCount: 6,
            },
        ],
        hasTimeout: true,
    },
};

export const indicatorsTableConfig = `
<table>
  <if>
    <condition>{ALGO|TEST_RND|01} > 5</condition>
  </if>
  <if>
    <condition>age({ALGO|TEST_RND|02}) > 265130</condition>
  </if>
  <row>
    <if>
      <condition>lt({ALGO|TEST_RND|03}, 100)</condition>
    </if>
    <if>
      <condition>age({ALGO|TEST_RND|04}) > 265130</condition>
    </if>
    <cell>
      <text>
        <formula>age({ALGO|TEST_RND|05}) + {ALGO|TEST_RND|06}</formula>
      </text>
    </cell>
    <cell>
      <text>
        <format>Base text: %g</format>
        <formula>{ALGO|TEST_RND|07}</formula>
      </text>
      <if>
        <condition>{ALGO|TEST_RND|08} > 900000 && {ALGO|TEST_RND|09} > 170</condition>
      </if>
      <if>
        <condition>{ALGO|TEST_RND|10} > 900000 || gt({ALGO|TEST_RND|11}, 170)</condition>
      </if>
    </cell>
    <row>
      <cell>
        <text>Level 2.1</text>
      </cell>
      <cell>
        <text>Level 2.2</text>
      </cell>
      <cell>
        <text>
          <format>Age: %g seconds</format>
          <formula>age({ALGO|TEST_RND|12})</formula>
        </text>
      </cell>
      <row>
        <if>
          <condition>age({ALGO|TEST_RND|13}) > 265130</condition>
        </if>
        <cell>
          <text>
            <format>Age: %g seconds</format>
            <formula>age({ALGO|TEST_RND|14}) - {ALGO|TEST_RND|15}</formula>
          </text>
        </cell>
        <row>
          <cell>
            <text>Some text 1</text>
          </cell>
          <cell>
            <text>Some text 2</text>
          </cell>
          <cell>
            <text>
              <format>Age: %g seconds</format>
              <formula>age({ALGO|TEST_RND|16})</formula>
            </text>
          </cell>
        </row>
      </row>
    </row>
  </row>
</table>
`;

export const indicatorsParsedTable = {
    table: {
        allIndicators: [
            {
                name: 'ALGO|TEST_RND|01',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|02',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|03',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|04',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|05',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|06',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|07',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|08',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|09',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|10',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|11',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|12',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|13',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|14',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|15',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|16',
                url: 'wss://localhost/default/',
            },
        ],
        indicators: [
            {
                name: 'ALGO|TEST_RND|01',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|02',
                url: 'wss://localhost/default/',
            },
        ],
        conditions: [
            {
                condition: {
                    indicators: [
                        {
                            name: 'ALGO|TEST_RND|01',
                            url: 'wss://localhost/default/',
                        },
                    ],
                },
            },
            {
                condition: {
                    indicators: [
                        {
                            name: 'ALGO|TEST_RND|02',
                            url: 'wss://localhost/default/',
                        },
                    ],
                },
            },
        ],
        rows: [
            {
                allIndicators: [
                    {
                        name: 'ALGO|TEST_RND|03',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|04',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|05',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|06',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|07',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|08',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|09',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|10',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|11',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|12',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|13',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|14',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|15',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|16',
                        url: 'wss://localhost/default/',
                    },
                ],
                indicators: [
                    {
                        name: 'ALGO|TEST_RND|03',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|04',
                        url: 'wss://localhost/default/',
                    },
                ],
                conditions: [
                    {
                        condition: {
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|03',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                        },
                    },
                    {
                        condition: {
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|04',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                        },
                    },
                ],
                rows: [
                    {
                        allIndicators: [
                            {
                                name: 'ALGO|TEST_RND|12',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|13',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|14',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|15',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|16',
                                url: 'wss://localhost/default/',
                            },
                        ],
                        rows: [
                            {
                                allIndicators: [
                                    {
                                        name: 'ALGO|TEST_RND|13',
                                        url: 'wss://localhost/default/',
                                    },
                                    {
                                        name: 'ALGO|TEST_RND|14',
                                        url: 'wss://localhost/default/',
                                    },
                                    {
                                        name: 'ALGO|TEST_RND|15',
                                        url: 'wss://localhost/default/',
                                    },
                                    {
                                        name: 'ALGO|TEST_RND|16',
                                        url: 'wss://localhost/default/',
                                    },
                                ],
                                indicators: [
                                    {
                                        name: 'ALGO|TEST_RND|13',
                                        url: 'wss://localhost/default/',
                                    },
                                ],
                                conditions: [
                                    {
                                        condition: {
                                            indicators: [
                                                {
                                                    name: 'ALGO|TEST_RND|13',
                                                    url: 'wss://localhost/default/',
                                                },
                                            ],
                                        },
                                    },
                                ],
                                rows: [
                                    {
                                        allIndicators: [
                                            {
                                                name: 'ALGO|TEST_RND|16',
                                                url: 'wss://localhost/default/',
                                            },
                                        ],
                                        cells: [
                                            {},
                                            {},
                                            {
                                                parameters: {
                                                    text: {
                                                        formula: {
                                                            indicators: [
                                                                {
                                                                    name: 'ALGO|TEST_RND|16',
                                                                    url: 'wss://localhost/default/',
                                                                },
                                                            ],
                                                        },
                                                    },
                                                },
                                                indicators: [
                                                    {
                                                        name: 'ALGO|TEST_RND|16',
                                                        url: 'wss://localhost/default/',
                                                    },
                                                ],
                                            },
                                        ],
                                    },
                                ],
                                cells: [
                                    {
                                        parameters: {
                                            text: {
                                                formula: {
                                                    indicators: [
                                                        {
                                                            name: 'ALGO|TEST_RND|14',
                                                            url: 'wss://localhost/default/',
                                                        },
                                                        {
                                                            name: 'ALGO|TEST_RND|15',
                                                            url: 'wss://localhost/default/',
                                                        },
                                                    ],
                                                },
                                            },
                                        },
                                        indicators: [
                                            {
                                                name: 'ALGO|TEST_RND|14',
                                                url: 'wss://localhost/default/',
                                            },
                                            {
                                                name: 'ALGO|TEST_RND|15',
                                                url: 'wss://localhost/default/',
                                            },
                                        ],
                                    },
                                ],
                            },
                        ],
                        cells: [
                            {},
                            {},
                            {
                                parameters: {
                                    text: {
                                        formula: {
                                            indicators: [
                                                {
                                                    name: 'ALGO|TEST_RND|12',
                                                    url: 'wss://localhost/default/',
                                                },
                                            ],
                                        },
                                    },
                                },
                                indicators: [
                                    {
                                        name: 'ALGO|TEST_RND|12',
                                        url: 'wss://localhost/default/',
                                    },
                                ],
                            },
                        ],
                    },
                ],
                cells: [
                    {
                        parameters: {
                            text: {
                                formula: {
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|05',
                                            url: 'wss://localhost/default/',
                                        },
                                        {
                                            name: 'ALGO|TEST_RND|06',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                },
                            },
                        },
                        indicators: [
                            {
                                name: 'ALGO|TEST_RND|05',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|06',
                                url: 'wss://localhost/default/',
                            },
                        ],
                    },
                    {
                        parameters: {
                            text: {
                                formula: {
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|07',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                },
                            },
                        },
                        conditions: [
                            {
                                condition: {
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|08',
                                            url: 'wss://localhost/default/',
                                        },
                                        {
                                            name: 'ALGO|TEST_RND|09',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                },
                            },
                            {
                                condition: {
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|10',
                                            url: 'wss://localhost/default/',
                                        },
                                        {
                                            name: 'ALGO|TEST_RND|11',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                },
                            },
                        ],
                        indicators: [
                            {
                                name: 'ALGO|TEST_RND|07',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|08',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|09',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|10',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'ALGO|TEST_RND|11',
                                url: 'wss://localhost/default/',
                            },
                        ],
                    },
                ],
            },
        ],
    },
};

export const formulaTableConfig = `
<table>
  <scope>
    function getFive() {
      return 5;
    }
  </scope>
  <if>
    <condition>{ALGO|TEST_RND|01} > getFive()</condition>
  </if>
  <if>
    <condition>age({ALGO|TEST_RND|02}) > 265130</condition>
  </if>
  <row>
    <if>
      <condition>lt({ALGO|TEST_RND|03}, 100)</condition>
    </if>
    <if>
      <condition>lt(age({ALGO|TEST_RND|04}), 265130)</condition>
    </if>
    <cell>
      <text>
        <formula>age({ALGO|TEST_RND|05}) + {ALGO|TEST_RND|06}</formula>
      </text>
    </cell>
    <cell>
      <text>
        <format>Base text: %g</format>
        <formula>{ALGO|TEST_RND|07} + getFive()</formula>
      </text>
      <if>
        <condition>{ALGO|TEST_RND|08} > 900000 && gt({ALGO|TEST_RND|09}, 170)</condition>
      </if>
      <if>
        <condition>{ALGO|TEST_RND|10} > 900000 || gt(age({ALGO|TEST_RND|11}), 170)</condition>
      </if>
    </cell>
    <row>
      <cell>
        <text>
          <format>Age: %g seconds</format>
          <formula>age({ALGO|TEST_RND|12})</formula>
        </text>
      </cell>
      <row>
        <if>
          <condition>gt(age({ALGO|TEST_RND|13}), 265130)</condition>
        </if>
      </row>
    </row>
  </row>
</table>
`;

export const formulaParsedTable = {
    table: {
        scope: `function getFive() {
      return 5;
    }`,
        conditions: [
            {
                condition: {
                    original: '{ALGO|TEST_RND|01} > getFive()',
                    hasTimeout: false,
                },
            },
            {
                condition: {
                    original: 'age({ALGO|TEST_RND|02}) > 265130',
                    hasTimeout: true,
                },
            },
        ],
        rows: [
            {
                conditions: [
                    {
                        condition: {
                            original: 'lt({ALGO|TEST_RND|03}, 100)',
                            hasTimeout: false,
                        },
                    },
                    {
                        condition: {
                            original: 'lt(age({ALGO|TEST_RND|04}), 265130)',
                            hasTimeout: true,
                        },
                    },
                ],
                rows: [
                    {
                        rows: [
                            {
                                conditions: [
                                    {
                                        condition: {
                                            original: 'gt(age({ALGO|TEST_RND|13}), 265130)',
                                            hasTimeout: true,
                                        },
                                    },
                                ],
                                hasTimeout: true,
                            },
                        ],
                        cells: [
                            {
                                parameters: {
                                    text: {
                                        formula: {
                                            original: 'age({ALGO|TEST_RND|12})',
                                            hasTimeout: true,
                                        },
                                    },
                                },
                            },
                        ],
                        hasTimeout: true,
                    },
                ],
                cells: [
                    {
                        parameters: {
                            text: {
                                formula: {
                                    original: 'age({ALGO|TEST_RND|05}) + {ALGO|TEST_RND|06}',
                                    hasTimeout: true,
                                },
                            },
                        },
                        hasTimeout: true,
                    },
                    {
                        parameters: {
                            text: {
                                formula: {
                                    original: '{ALGO|TEST_RND|07} + getFive()',
                                    hasTimeout: false,
                                },
                            },
                        },
                        conditions: [
                            {
                                condition: {
                                    original:
                                        '{ALGO|TEST_RND|08} > 900000 && gt({ALGO|TEST_RND|09}, 170)',
                                    hasTimeout: false,
                                },
                            },
                            {
                                condition: {
                                    original:
                                        '{ALGO|TEST_RND|10} > 900000 || gt(age({ALGO|TEST_RND|11}), 170)',
                                    hasTimeout: true,
                                },
                            },
                        ],
                        hasTimeout: true,
                    },
                ],
                hasTimeout: true,
            },
        ],
        hasTimeout: true,
    },
};

export const templateTableConfig = `
<table>
  <source>
    <name>source</name>
    <url>wss://localhost/source/</url>
  </source>

  <template>
    <name>Template name</name>

    <parameters>
        <parameter>{param1    }</parameter>
        <parameter>{    param2      }</parameter>
    </parameters>
    
    <text>
      <format>Base text in template: %g</format>
      <formula>age({   param1     }) + 5</formula>
    </text>
    
    <tooltip>Tooltip in template</tooltip>
    
    <style>
      <background_color>red</background_color>
      <border>3px solid black</border>
      <border_radius>10px</border_radius>
    </style>

    <if>
      <condition>eq({param1}, 0)</condition>
      <text>
        <format>Base text: %g</format>
        <formula>age({param2})</formula>
      </text>
    </if>

    <if>
      <condition>eq({indicator_name100}, 2)</condition>
      <text>text</text>
    </if>
  </template>

  <row>
    <cell>
      <use-template>
        <name>Template name</name>
        <parameters>
           <parameter>{source}.{     indicator_name1}</parameter>
           <parameter>{indicator_name2     }</parameter>
        </parameters>
      </use-template>
      
      <tooltip>Tooltip</tooltip>
      
      <style>
        <background_color></background_color>
      </style>
    </cell>

    <cell>
      <use-template>
        <name>Template name</name>
        <parameters>
           <parameter>{indicator_name3}</parameter>
           <parameter>{indicator_name4}</parameter>
        </parameters>
      </use-template>
      
      <text>
        <format>Base text: %g</format>
        <formula>{ALGO|TEST_RND|007}</formula>
      </text>
    </cell>

    <cell>
      <use-template>
        <name>Template name</name>
        <parameters>
           <parameter>{indicator_name5}</parameter>
           <parameter>{indicator_name6}</parameter>
        </parameters>
      </use-template>
      
      <text>FooBar</text>
      <tooltip>Tooltip</tooltip>
    </cell>

    <row>
      <cell />
      <row>
        <cell>
          <use-template>
            <name>Template name</name>
            <parameters>
               <parameter>{indicator_name1}</parameter>
               <parameter>{indicator_name2}</parameter>
            </parameters>
          </use-template>
          
          <tooltip>Tooltip</tooltip>
        </cell>
      </row>
    </row>
  </row>
</table>
`;

export const templateParsedTable = {
    table: {
        allIndicators: [
            {
                name: 'ALGO|TEST_RND|007',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name100',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name1',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name2',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name3',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name4',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name5',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name6',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name1',
                url: 'wss://localhost/source/',
            },
        ],
        rows: [
            {
                allIndicators: [
                    {
                        name: 'ALGO|TEST_RND|007',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name100',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name1',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name2',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name3',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name4',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name5',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name6',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name1',
                        url: 'wss://localhost/source/',
                    },
                ],
                cells: [
                    {
                        conditions: [
                            {
                                condition: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return eq(getIndicatorValue(indicators, '{wss://localhost/source/}.{indicator_name1}' + `.{${backtestingRunId ?? 0}}`), 0)",
                                    ],
                                    hasTimeout: false,
                                    indicators: [
                                        {
                                            name: 'indicator_name1',
                                            url: 'wss://localhost/source/',
                                        },
                                    ],
                                    original: 'eq({source}.{indicator_name1}, 0)',
                                },
                                parameters: {
                                    text: {
                                        format: 'Base text: %g',
                                        formula: {
                                            constructorArguments: [
                                                'indicators',
                                                'backtestingRunId',
                                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name2}' + `.{${backtestingRunId ?? 0}}`))",
                                            ],
                                            hasTimeout: true,
                                            indicators: [
                                                {
                                                    name: 'indicator_name2',
                                                    url: 'wss://localhost/default/',
                                                },
                                            ],
                                            original: 'age({indicator_name2})',
                                        },
                                    },
                                },
                            },
                            {
                                condition: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name100}' + `.{${backtestingRunId ?? 0}}`), 2)",
                                    ],
                                    hasTimeout: false,
                                    indicators: [
                                        {
                                            name: 'indicator_name100',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    original: 'eq({indicator_name100}, 2)',
                                },
                                parameters: {
                                    text: 'text',
                                },
                            },
                        ],
                        hasTimeout: true,
                        indicators: [
                            {
                                name: 'indicator_name100',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name2',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name1',
                                url: 'wss://localhost/source/',
                            },
                        ],
                        parameters: {
                            style: {
                                backgroundColor: null,
                                border: '3px solid black',
                                borderRadius: '10px',
                            },
                            text: {
                                format: 'Base text in template: %g',
                                formula: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return age(getIndicatorValue(indicators, '{wss://localhost/source/}.{indicator_name1}' + `.{${backtestingRunId ?? 0}}`)) + 5",
                                    ],
                                    hasTimeout: true,
                                    indicators: [
                                        {
                                            name: 'indicator_name1',
                                            url: 'wss://localhost/source/',
                                        },
                                    ],
                                    original: 'age({source}.{indicator_name1}) + 5',
                                },
                            },
                            tooltip: 'Tooltip',
                        },
                    },
                    {
                        conditions: [
                            {
                                condition: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name3}' + `.{${backtestingRunId ?? 0}}`), 0)",
                                    ],
                                    hasTimeout: false,
                                    indicators: [
                                        {
                                            name: 'indicator_name3',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    original: 'eq({indicator_name3}, 0)',
                                },
                                parameters: {
                                    text: {
                                        format: 'Base text: %g',
                                        formula: {
                                            constructorArguments: [
                                                'indicators',
                                                'backtestingRunId',
                                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name4}' + `.{${backtestingRunId ?? 0}}`))",
                                            ],
                                            hasTimeout: true,
                                            indicators: [
                                                {
                                                    name: 'indicator_name4',
                                                    url: 'wss://localhost/default/',
                                                },
                                            ],
                                            original: 'age({indicator_name4})',
                                        },
                                    },
                                },
                            },
                            {
                                condition: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name100}' + `.{${backtestingRunId ?? 0}}`), 2)",
                                    ],
                                    hasTimeout: false,
                                    indicators: [
                                        {
                                            name: 'indicator_name100',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    original: 'eq({indicator_name100}, 2)',
                                },
                                parameters: {
                                    text: 'text',
                                },
                            },
                        ],
                        hasTimeout: false,
                        indicators: [
                            {
                                name: 'ALGO|TEST_RND|007',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name100',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name3',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name4',
                                url: 'wss://localhost/default/',
                            },
                        ],
                        parameters: {
                            style: {
                                backgroundColor: 'red',
                                border: '3px solid black',
                                borderRadius: '10px',
                            },
                            text: {
                                format: 'Base text: %g',
                                formula: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|007}' + `.{${backtestingRunId ?? 0}}`)",
                                    ],
                                    hasTimeout: false,
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|007',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    original: '{ALGO|TEST_RND|007}',
                                },
                            },
                            tooltip: 'Tooltip in template',
                        },
                    },
                    {
                        conditions: [
                            {
                                condition: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name5}' + `.{${backtestingRunId ?? 0}}`), 0)",
                                    ],
                                    hasTimeout: false,
                                    indicators: [
                                        {
                                            name: 'indicator_name5',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    original: 'eq({indicator_name5}, 0)',
                                },
                                parameters: {
                                    text: {
                                        format: 'Base text: %g',
                                        formula: {
                                            constructorArguments: [
                                                'indicators',
                                                'backtestingRunId',
                                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name6}' + `.{${backtestingRunId ?? 0}}`))",
                                            ],
                                            hasTimeout: true,
                                            indicators: [
                                                {
                                                    name: 'indicator_name6',
                                                    url: 'wss://localhost/default/',
                                                },
                                            ],
                                            original: 'age({indicator_name6})',
                                        },
                                    },
                                },
                            },
                            {
                                condition: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name100}' + `.{${backtestingRunId ?? 0}}`), 2)",
                                    ],
                                    hasTimeout: false,
                                    indicators: [
                                        {
                                            name: 'indicator_name100',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    original: 'eq({indicator_name100}, 2)',
                                },
                                parameters: {
                                    text: 'text',
                                },
                            },
                        ],
                        hasTimeout: false,
                        indicators: [
                            {
                                name: 'indicator_name100',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name5',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name6',
                                url: 'wss://localhost/default/',
                            },
                        ],
                        parameters: {
                            style: {
                                backgroundColor: 'red',
                                border: '3px solid black',
                                borderRadius: '10px',
                            },
                            text: 'FooBar',
                            tooltip: 'Tooltip',
                        },
                    },
                ],
                rows: [
                    {
                        allIndicators: [
                            {
                                name: 'indicator_name100',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name1',
                                url: 'wss://localhost/default/',
                            },
                            {
                                name: 'indicator_name2',
                                url: 'wss://localhost/default/',
                            },
                        ],
                        cells: [{}],
                        rows: [
                            {
                                allIndicators: [
                                    {
                                        name: 'indicator_name100',
                                        url: 'wss://localhost/default/',
                                    },
                                    {
                                        name: 'indicator_name1',
                                        url: 'wss://localhost/default/',
                                    },
                                    {
                                        name: 'indicator_name2',
                                        url: 'wss://localhost/default/',
                                    },
                                ],
                                cells: [
                                    {
                                        conditions: [
                                            {
                                                condition: {
                                                    constructorArguments: [
                                                        'indicators',
                                                        'backtestingRunId',
                                                        "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name1}' + `.{${backtestingRunId ?? 0}}`), 0)",
                                                    ],
                                                    hasTimeout: false,
                                                    indicators: [
                                                        {
                                                            name: 'indicator_name1',
                                                            url: 'wss://localhost/default/',
                                                        },
                                                    ],
                                                    original: 'eq({indicator_name1}, 0)',
                                                },
                                                parameters: {
                                                    text: {
                                                        format: 'Base text: %g',
                                                        formula: {
                                                            constructorArguments: [
                                                                'indicators',
                                                                'backtestingRunId',
                                                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name2}' + `.{${backtestingRunId ?? 0}}`))",
                                                            ],
                                                            hasTimeout: true,
                                                            indicators: [
                                                                {
                                                                    name: 'indicator_name2',
                                                                    url: 'wss://localhost/default/',
                                                                },
                                                            ],
                                                            original: 'age({indicator_name2})',
                                                        },
                                                    },
                                                },
                                            },
                                            {
                                                condition: {
                                                    constructorArguments: [
                                                        'indicators',
                                                        'backtestingRunId',
                                                        "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name100}' + `.{${backtestingRunId ?? 0}}`), 2)",
                                                    ],
                                                    hasTimeout: false,
                                                    indicators: [
                                                        {
                                                            name: 'indicator_name100',
                                                            url: 'wss://localhost/default/',
                                                        },
                                                    ],
                                                    original: 'eq({indicator_name100}, 2)',
                                                },
                                                parameters: {
                                                    text: 'text',
                                                },
                                            },
                                        ],
                                        hasTimeout: true,
                                        indicators: [
                                            {
                                                name: 'indicator_name100',
                                                url: 'wss://localhost/default/',
                                            },
                                            {
                                                name: 'indicator_name1',
                                                url: 'wss://localhost/default/',
                                            },
                                            {
                                                name: 'indicator_name2',
                                                url: 'wss://localhost/default/',
                                            },
                                        ],
                                        parameters: {
                                            style: {
                                                backgroundColor: 'red',
                                                border: '3px solid black',
                                                borderRadius: '10px',
                                            },
                                            text: {
                                                format: 'Base text in template: %g',
                                                formula: {
                                                    constructorArguments: [
                                                        'indicators',
                                                        'backtestingRunId',
                                                        "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name1}' + `.{${backtestingRunId ?? 0}}`)) + 5",
                                                    ],
                                                    hasTimeout: true,
                                                    indicators: [
                                                        {
                                                            name: 'indicator_name1',
                                                            url: 'wss://localhost/default/',
                                                        },
                                                    ],
                                                    original: 'age({indicator_name1}) + 5',
                                                },
                                            },
                                            tooltip: 'Tooltip',
                                        },
                                    },
                                ],
                            },
                        ],
                    },
                ],
            },
        ],
    },
};

export const fullFeatureGridConfig = `
<grid>
  <scope>
    function getFive() {
      return 5;
    }
  </scope>
  <style>
    <gap>20px</gap>
  </style>
  <columns>10</columns>
  <if>
    <condition>{ALGO|TEST_RND|00} > getFive() * 100</condition>
    <style>
      <background_color>green</background_color>
    </style>
  </if>
  <cell>
    <column>1</column>
    <text>
      <format>Base text: %g</format>
      <formula>{ALGO|TEST_RND|01}</formula>
    </text>
    <style>
      <background_color>blue</background_color>
    </style>
    <mark>
      <style>
        <color>white</color>
      </style>
    </mark>
    <if>
      <condition>{ALGO|TEST_RND|02} > 500</condition>
      <style>
        <background_color>red</background_color>
        <border>3px solid black</border>
        <border_radius>10px</border_radius>
      </style>
      <tooltip>Foo</tooltip>
      <text>
        <format>Changed label: %g</format>
        <formula>{ALGO|TEST_RND|01}</formula>
      </text>
      <mark>
        <style>
          <color>black</color>
          <width>30px</width>
          <height>30px</height>
        </style>
      </mark>
    </if>
  </cell>
  <cell>
    <column>3</column>
    <text>
      <format>Base text: %g</format>
      <formula>{ALGO|TEST_RND|01}</formula>
    </text>
    <style>
      <background_color>blue</background_color>
    </style>
    <mark>
      <style>
        <color>white</color>
      </style>
    </mark>
    <if>
      <condition>{ALGO|TEST_RND|02} > 500</condition>
      <style>
        <display>none</display>
      </style>
    </if>
  </cell>
  <cell>
    <column>5</column>
    <text>
      <format>Base text: %g seconds</format>
      <formula>age({ALGO|TEST_RND|01})</formula>
    </text>
    <style>
      <background_color>blue</background_color>
    </style>
    <mark>
      <style>
        <color>white</color>
      </style>
    </mark>
    <if>
      <condition>{ALGO|TEST_RND|02} > 500</condition>
      <style>
        <background_color>red</background_color>
        <border>3px solid black</border>
        <border_radius>10px</border_radius>
      </style>
      <tooltip>Foo</tooltip>
      <text>
        <format>Changed label: %g seconds</format>
        <formula>age({ALGO|TEST_RND|01})</formula>
      </text>
      <mark>
        <style>
          <color>black</color>
          <width>30px</width>
          <height>30px</height>
        </style>
      </mark>
    </if>
  </cell>
</grid>
`;

export const fullFeatureParsedGrid = {
    grid: {
        scope: `function getFive() {
      return 5;
    }`,
        allIndicators: [
            {
                name: 'ALGO|TEST_RND|00',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|01',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|02',
                url: 'wss://localhost/default/',
            },
        ],
        indicators: [
            {
                name: 'ALGO|TEST_RND|00',
                url: 'wss://localhost/default/',
            },
        ],
        parameters: {
            style: {
                gap: '20px',
            },
            columnsCount: 10,
        },
        conditions: [
            {
                condition: {
                    original: '{ALGO|TEST_RND|00} > getFive() * 100',
                    constructorArguments: [
                        'indicators',
                        'backtestingRunId',
                        "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|00}' + `.{${backtestingRunId ?? 0}}`) > getFive() * 100",
                    ],
                    indicators: [
                        {
                            name: 'ALGO|TEST_RND|00',
                            url: 'wss://localhost/default/',
                        },
                    ],
                    hasTimeout: false,
                },
                parameters: {
                    style: {
                        backgroundColor: 'green',
                    },
                },
            },
        ],
        cells: [
            {
                parameters: {
                    column: 1,
                    text: {
                        format: 'Base text: %g',
                        formula: {
                            original: '{ALGO|TEST_RND|01}',
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`)",
                            ],
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|01',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            hasTimeout: false,
                        },
                    },
                    style: {
                        backgroundColor: 'blue',
                    },
                    mark: {
                        style: {
                            color: 'white',
                        },
                    },
                },
                conditions: [
                    {
                        condition: {
                            original: '{ALGO|TEST_RND|02} > 500',
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`) > 500",
                            ],
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|02',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            hasTimeout: false,
                        },
                        parameters: {
                            style: {
                                backgroundColor: 'red',
                                border: '3px solid black',
                                borderRadius: '10px',
                            },
                            tooltip: 'Foo',
                            text: {
                                format: 'Changed label: %g',
                                formula: {
                                    original: '{ALGO|TEST_RND|01}',
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`)",
                                    ],
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|01',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    hasTimeout: false,
                                },
                            },
                            mark: {
                                style: {
                                    color: 'black',
                                    width: '30px',
                                    height: '30px',
                                },
                            },
                        },
                    },
                ],
                indicators: [
                    {
                        name: 'ALGO|TEST_RND|01',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|02',
                        url: 'wss://localhost/default/',
                    },
                ],
                hasTimeout: false,
            },
            {
                parameters: {
                    column: 3,
                    text: {
                        format: 'Base text: %g',
                        formula: {
                            original: '{ALGO|TEST_RND|01}',
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`)",
                            ],
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|01',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            hasTimeout: false,
                        },
                    },
                    style: {
                        backgroundColor: 'blue',
                    },
                    mark: {
                        style: {
                            color: 'white',
                        },
                    },
                },
                conditions: [
                    {
                        condition: {
                            original: '{ALGO|TEST_RND|02} > 500',
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`) > 500",
                            ],
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|02',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            hasTimeout: false,
                        },
                        parameters: {
                            style: {
                                display: 'none',
                            },
                        },
                    },
                ],
                indicators: [
                    {
                        name: 'ALGO|TEST_RND|01',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|02',
                        url: 'wss://localhost/default/',
                    },
                ],
                hasTimeout: false,
            },
            {
                parameters: {
                    column: 5,
                    text: {
                        format: 'Base text: %g seconds',
                        formula: {
                            original: 'age({ALGO|TEST_RND|01})',
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`))",
                            ],
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|01',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            hasTimeout: true,
                        },
                    },
                    style: {
                        backgroundColor: 'blue',
                    },
                    mark: {
                        style: {
                            color: 'white',
                        },
                    },
                },
                conditions: [
                    {
                        condition: {
                            original: '{ALGO|TEST_RND|02} > 500',
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|02}' + `.{${backtestingRunId ?? 0}}`) > 500",
                            ],
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|02',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            hasTimeout: false,
                        },
                        parameters: {
                            style: {
                                backgroundColor: 'red',
                                border: '3px solid black',
                                borderRadius: '10px',
                            },
                            tooltip: 'Foo',
                            text: {
                                format: 'Changed label: %g seconds',
                                formula: {
                                    original: 'age({ALGO|TEST_RND|01})',
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|01}' + `.{${backtestingRunId ?? 0}}`))",
                                    ],
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|01',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    hasTimeout: true,
                                },
                            },
                            mark: {
                                style: {
                                    color: 'black',
                                    width: '30px',
                                    height: '30px',
                                },
                            },
                        },
                    },
                ],
                indicators: [
                    {
                        name: 'ALGO|TEST_RND|01',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|02',
                        url: 'wss://localhost/default/',
                    },
                ],
                hasTimeout: true,
            },
        ],
    },
};

export const indicatorsGridConfig = `
<grid>
  <if>
    <condition>{ALGO|TEST_RND|00} > 500</condition>
  </if>
  <cell>
    <text>
      <format>Base text: %g</format>
      <formula>{ALGO|TEST_RND|01}</formula>
    </text>
    <if>
      <condition>{ALGO|TEST_RND|02} > 500 && lt(age({ALGO|TEST_RND|03}), 200)</condition>
      <text>
        <format>Changed label: %g</format>
        <formula>{ALGO|TEST_RND|04}</formula>
      </text>
    </if>
    <if>
      <condition>{ALGO|TEST_RND|05} > 500</condition>
      <text>
        <format>Changed label: %g</format>
        <formula>{ALGO|TEST_RND|06} && {ALGO|TEST_RND|07}</formula>
      </text>
    </if>
  </cell>
  <cell>
    <text>
      <format>Base text: %g</format>
      <formula>{ALGO|TEST_RND|08}</formula>
    </text>
    <if>
      <condition>{ALGO|TEST_RND|09} > 500</condition>
    </if>
  </cell>
</grid>            
            `;

export const indicatorsParsedGrid = {
    grid: {
        allIndicators: [
            {
                name: 'ALGO|TEST_RND|00',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|01',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|02',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|03',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|04',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|05',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|06',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|07',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|08',
                url: 'wss://localhost/default/',
            },
            {
                name: 'ALGO|TEST_RND|09',
                url: 'wss://localhost/default/',
            },
        ],
        indicators: [
            {
                name: 'ALGO|TEST_RND|00',
                url: 'wss://localhost/default/',
            },
        ],
        conditions: [
            {
                condition: {
                    indicators: [
                        {
                            name: 'ALGO|TEST_RND|00',
                            url: 'wss://localhost/default/',
                        },
                    ],
                },
            },
        ],
        cells: [
            {
                parameters: {
                    text: {
                        formula: {
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|01',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                        },
                    },
                },
                conditions: [
                    {
                        condition: {
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|02',
                                    url: 'wss://localhost/default/',
                                },
                                {
                                    name: 'ALGO|TEST_RND|03',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                        },
                        parameters: {
                            text: {
                                formula: {
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|04',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                    {
                        condition: {
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|05',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                        },
                        parameters: {
                            text: {
                                formula: {
                                    indicators: [
                                        {
                                            name: 'ALGO|TEST_RND|06',
                                            url: 'wss://localhost/default/',
                                        },
                                        {
                                            name: 'ALGO|TEST_RND|07',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                },
                            },
                        },
                    },
                ],
                indicators: [
                    {
                        name: 'ALGO|TEST_RND|01',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|02',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|03',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|04',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|05',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|06',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|07',
                        url: 'wss://localhost/default/',
                    },
                ],
            },
            {
                parameters: {
                    text: {
                        formula: {
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|08',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                        },
                    },
                },
                conditions: [
                    {
                        condition: {
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|09',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                        },
                    },
                ],
                indicators: [
                    {
                        name: 'ALGO|TEST_RND|08',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'ALGO|TEST_RND|09',
                        url: 'wss://localhost/default/',
                    },
                ],
            },
        ],
    },
};

export const templateFeatureGridConfig = `
<grid>
  <source>
    <name>source</name>
    <url>wss://localhost/source/</url>
  </source>

  <template>
    <name>Template name</name>

    <parameters>
        <parameter>{param1}</parameter>
        <parameter>{param2}</parameter>
    </parameters>
    
    <text>
      <format>Base text in template: %g</format>
      <formula>age({param1}) + 5</formula>
    </text>
    
    <tooltip>Tooltip in template</tooltip>
    
    <style>
      <background_color>red</background_color>
      <border>3px solid black</border>
      <border_radius>10px</border_radius>
    </style>

    <mark>
      <style>
        <color>white</color>
      </style>
    </mark>
    
    <if>
      <condition>eq({param1}, 0)</condition>
      <text>
        <format>Base text: %g</format>
        <formula>age({param2})</formula>
      </text>
    </if>

    <if>
      <condition>eq({indicator_name100}, 2)</condition>
      <text>text</text>
    </if>
  </template>

  <cell>
    <use-template>
      <name>Template name</name>
      <parameters>
         <parameter>{indicator_name1}</parameter>
         <parameter>{indicator_name2}</parameter>
      </parameters>
    </use-template>

    <column>1</column>

    <text>Hey</text>

    <style>
      <background_color />
    </style>
    
    <mark>
      <style>
        <background>black</background>
      </style>
    </mark>
    
    <if>
      <condition>{ALGO|TEST_RND|007} > 500</condition>
      <style>
        <background_color>red</background_color>
        <border>3px solid black</border>
        <border_radius>10px</border_radius>
      </style>
      <tooltip>Foo</tooltip>
    </if>
  </cell>
  
  <cell>
    <use-template>
      <name>Template name</name>
      <parameters>
         <parameter>{source}.{indicator_name11}</parameter>
         <parameter>{indicator_name22}</parameter>
      </parameters>
    </use-template>

    <column>3</column>

    <mark>
      <style>
        <color></color>
      </style>
    </mark>
  </cell>
</grid>
`;

export const templateFeatureParsedGrid = {
    grid: {
        allIndicators: [
            {
                name: 'ALGO|TEST_RND|007',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name100',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name1',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name22',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name2',
                url: 'wss://localhost/default/',
            },
            {
                name: 'indicator_name11',
                url: 'wss://localhost/source/',
            },
        ],
        cells: [
            {
                conditions: [
                    {
                        condition: {
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name1}' + `.{${backtestingRunId ?? 0}}`), 0)",
                            ],
                            hasTimeout: false,
                            indicators: [
                                {
                                    name: 'indicator_name1',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            original: 'eq({indicator_name1}, 0)',
                        },
                        parameters: {
                            text: {
                                format: 'Base text: %g',
                                formula: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name2}' + `.{${backtestingRunId ?? 0}}`))",
                                    ],
                                    hasTimeout: true,
                                    indicators: [
                                        {
                                            name: 'indicator_name2',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    original: 'age({indicator_name2})',
                                },
                            },
                        },
                    },
                    {
                        condition: {
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name100}' + `.{${backtestingRunId ?? 0}}`), 2)",
                            ],
                            hasTimeout: false,
                            indicators: [
                                {
                                    name: 'indicator_name100',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            original: 'eq({indicator_name100}, 2)',
                        },
                        parameters: {
                            text: 'text',
                        },
                    },
                    {
                        condition: {
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return getIndicatorValue(indicators, '{wss://localhost/default/}.{ALGO|TEST_RND|007}' + `.{${backtestingRunId ?? 0}}`) > 500",
                            ],
                            hasTimeout: false,
                            indicators: [
                                {
                                    name: 'ALGO|TEST_RND|007',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            original: '{ALGO|TEST_RND|007} > 500',
                        },
                        parameters: {
                            style: {
                                backgroundColor: 'red',
                                border: '3px solid black',
                                borderRadius: '10px',
                            },
                            tooltip: 'Foo',
                        },
                    },
                ],
                hasTimeout: false,
                indicators: [
                    {
                        name: 'ALGO|TEST_RND|007',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name100',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name1',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name2',
                        url: 'wss://localhost/default/',
                    },
                ],
                parameters: {
                    mark: {
                        style: {
                            background: 'black',
                            color: 'white',
                        },
                    },
                    style: {
                        backgroundColor: null,
                        border: '3px solid black',
                        borderRadius: '10px',
                    },
                    text: 'Hey',
                    tooltip: 'Tooltip in template',
                },
            },
            {
                conditions: [
                    {
                        condition: {
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return eq(getIndicatorValue(indicators, '{wss://localhost/source/}.{indicator_name11}' + `.{${backtestingRunId ?? 0}}`), 0)",
                            ],
                            hasTimeout: false,
                            indicators: [
                                {
                                    name: 'indicator_name11',
                                    url: 'wss://localhost/source/',
                                },
                            ],
                            original: 'eq({source}.{indicator_name11}, 0)',
                        },
                        parameters: {
                            text: {
                                format: 'Base text: %g',
                                formula: {
                                    constructorArguments: [
                                        'indicators',
                                        'backtestingRunId',
                                        "return age(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name22}' + `.{${backtestingRunId ?? 0}}`))",
                                    ],
                                    hasTimeout: true,
                                    indicators: [
                                        {
                                            name: 'indicator_name22',
                                            url: 'wss://localhost/default/',
                                        },
                                    ],
                                    original: 'age({indicator_name22})',
                                },
                            },
                        },
                    },
                    {
                        condition: {
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return eq(getIndicatorValue(indicators, '{wss://localhost/default/}.{indicator_name100}' + `.{${backtestingRunId ?? 0}}`), 2)",
                            ],
                            hasTimeout: false,
                            indicators: [
                                {
                                    name: 'indicator_name100',
                                    url: 'wss://localhost/default/',
                                },
                            ],
                            original: 'eq({indicator_name100}, 2)',
                        },
                        parameters: {
                            text: 'text',
                        },
                    },
                ],
                hasTimeout: true,
                indicators: [
                    {
                        name: 'indicator_name100',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name22',
                        url: 'wss://localhost/default/',
                    },
                    {
                        name: 'indicator_name11',
                        url: 'wss://localhost/source/',
                    },
                ],
                parameters: {
                    mark: {
                        style: {
                            color: null,
                        },
                    },
                    style: {
                        backgroundColor: 'red',
                        border: '3px solid black',
                        borderRadius: '10px',
                    },
                    text: {
                        format: 'Base text in template: %g',
                        formula: {
                            constructorArguments: [
                                'indicators',
                                'backtestingRunId',
                                "return age(getIndicatorValue(indicators, '{wss://localhost/source/}.{indicator_name11}' + `.{${backtestingRunId ?? 0}}`)) + 5",
                            ],
                            hasTimeout: true,
                            indicators: [
                                {
                                    name: 'indicator_name11',
                                    url: 'wss://localhost/source/',
                                },
                            ],
                            original: 'age({source}.{indicator_name11}) + 5',
                        },
                    },
                    tooltip: 'Tooltip in template',
                },
            },
        ],
        hasTimeout: false,
    },
};
