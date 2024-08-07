import type { DeepPartial, Someseconds } from '@common/types';
import { EChartType } from '@frontend/charter/src/components/Chart/defs';
import { EVirtualViewport } from '@frontend/charter/src/components/ChartViewport/defs';
import { EFollowMode } from '@frontend/charter/src/plugins/AutoFollowViewport/def';
import type {
    TStorageDashboardConfig,
    TStorageDashboardName,
} from '@frontend/common/src/types/domain/dashboardsStorage';
import type { TSocketURL } from '@frontend/common/src/types/domain/sockets';
import type { TPromqlQuery } from '@frontend/common/src/utils/Promql';
import type { TSemverVersion } from '@frontend/common/src/utils/Semver/def';

import type { TDashboard } from '../../types/dashboard';
import { EPanelType, EServerTimeUnit } from '../../types/panel';

const Simple = `<dashboard>
  <name>panels_with_type.xml</name>
  <grid>
    <name>80x45</name>
    <cols_count>80</cols_count>
    <rows_count>45</rows_count>
    <margin>8</margin>
    <panel>
      <rel_width>0.2</rel_width>
      <rel_height>0.2</rel_height>
      <rel_min_width>0.2</rel_min_width>
      <rel_min_height>0.2</rel_min_height>
    </panel>
  </grid>
  <panels>
    <panel>
      <type>Charts</type>
      <settings>
        <url>ws://localhost</url>
        <min_zoom>1e-13</min_zoom>
        <follow_mode>permament</follow_mode>
        <closest_points>true</closest_points>
        <server_time_unit>nanosecond</server_time_unit>
        <server_time_increment>1609459200000000000</server_time_increment>
        <label>Test chart</label>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <charts>
        <chart>
          <id>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</id>
          <query>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</query>
          <label>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</label>
          <label_format>%s: %.4g</label_format>
          <type>points</type>
          <point_size>4</point_size>
          <color>8913151</color>
          <opacity>1</opacity>
          <y_axis>left</y_axis>
          <width>4</width>
        </chart>
        <chart>
          <id>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</id>
          <query>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</query>
          <label>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</label>
          <label_format>%s: %.4g</label_format>
          <type>lines</type>
          <width>1</width>
          <color>35071</color>
          <opacity>1</opacity>
          <y_axis>left</y_axis>
        </chart>
        <chart>
          <id>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</id>
          <query>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</query>
          <label>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</label>
          <label_format>%s: %.4g</label_format>
          <type>stairs</type>
          <width>1</width>
          <color>16746496</color>
          <opacity>1</opacity>
          <y_axis>right</y_axis>
        </chart>
        <chart>
          <id>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</id>
          <query>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</query>
          <label>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</label>
          <label_format>%s: %.4g</label_format>
          <type>points</type>
          <point_size>4</point_size>
          <color>16711816</color>
          <opacity>1</opacity>
          <y_axis>right</y_axis>
          <style_converter>ColorHighlighter</style_converter>
          <width>4</width>
        </chart>
      </charts>
      <schemes>
        <scheme>
          <element>
            <from>3000</from>
            <text>rgba(255, 128, 0, 128)</text>
          </element>
          <element>
            <from>2000</from>
            <to>3000</to>
            <text>rgba(0, 255, 128, 128)</text>
          </element>
          <element>
            <text>rgba(255, 0, 128, 128)</text>
          </element>
          <name>ColorHighlighter</name>
        </scheme>
      </schemes>
    </panel>
    <panel>
      <type>CustomViewTable</type>
      <settings>
        <url>ws://localhost</url>
        <label>Test indicators table</label>
        <server_time_unit>nanosecond</server_time_unit>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0.3333333333333333</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <table>
        <row>
          <cell />
        </row>
      </table>
    </panel>
    <panel>
      <type>CustomViewGrid</type>
      <settings>
        <url>ws://localhost</url>
        <label>Test indicators grid</label>
        <server_time_unit>nanosecond</server_time_unit>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0.6666666666666666</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <grid>
        <cell />
      </grid>
    </panel>
  </panels>
</dashboard>` as TStorageDashboardConfig;
const SimpleDashboard: DeepPartial<TDashboard> = {
    activeLayout: undefined,
    grid: {
        colsCount: 240,
        rowsCount: 180,
        margin: 4,
        name: '80x45',
        panel: {
            relWidth: 0.16666666666666666,
            relHeight: 0.16666666666666669,
            relMinWidth: 0.2,
            relMinHeight: 0.2,
        },
    },
    name: 'panels_with_type.xml' as TStorageDashboardName,
    panels: [
        {
            charts: [
                {
                    color: '#8800ff',
                    formula: undefined,
                    label: "indicators{name='BTC-ETH|UpbitSpot.l1.ask'}",
                    labelFormat: '%s: %.4g',
                    opacity: 1,
                    pointSize: 4,
                    query: "indicators{name='BTC-ETH|UpbitSpot.l1.ask'}" as TPromqlQuery,
                    styleConverter: undefined,
                    styleIndicator: undefined,
                    type: EChartType.points,
                    url: undefined,
                    width: 4,
                    yAxis: EVirtualViewport.left,
                },
                {
                    color: '#0088ff',
                    formula: undefined,
                    label: "indicators{name='KRW-ETH|UpbitSpot.l1.ask'}",
                    labelFormat: '%s: %.4g',
                    opacity: 1,
                    query: "indicators{name='KRW-ETH|UpbitSpot.l1.ask'}" as TPromqlQuery,
                    styleConverter: undefined,
                    styleIndicator: undefined,
                    type: EChartType.lines,
                    url: undefined,
                    width: 1,
                    yAxis: EVirtualViewport.left,
                },
                {
                    color: '#ff8800',
                    formula: undefined,
                    label: "indicators{name='BTC-ETH|UpbitSpot.l1.bid'}",
                    labelFormat: '%s: %.4g',
                    opacity: 1,
                    query: "indicators{name='BTC-ETH|UpbitSpot.l1.bid'}" as TPromqlQuery,
                    styleConverter: undefined,
                    styleIndicator: undefined,
                    type: EChartType.stairs,
                    url: undefined,
                    width: 1,
                    yAxis: EVirtualViewport.right,
                },
                {
                    color: '#ff0088',
                    formula: undefined,
                    label: "indicators{name='KRW-ETH|UpbitSpot.l1.bid'}",
                    labelFormat: '%s: %.4g',
                    opacity: 1,
                    pointSize: 4,
                    query: "indicators{name='KRW-ETH|UpbitSpot.l1.bid'}" as TPromqlQuery,
                    styleConverter: 'ColorHighlighter',
                    styleIndicator: undefined,
                    type: EChartType.points,
                    url: undefined,
                    width: 4,
                    yAxis: EVirtualViewport.right,
                },
            ],
            layouts: [
                {
                    relHeight: 1,
                    relMinHeight: 0.16666666666666666,
                    relMinWidth: 0.16666666666666666,
                    relWidth: 0.3333333333333333,
                    relX: 0,
                    relY: 0,
                },
            ],
            levels: undefined,
            schemes: [
                {
                    element: [
                        {
                            from: 3000,
                            text: 'rgba(255, 128, 0, 128)',
                        },
                        {
                            from: 2000,
                            text: 'rgba(0, 255, 128, 128)',
                            to: 3000,
                        },
                        {
                            text: 'rgba(255, 0, 128, 128)',
                        },
                    ],
                    name: 'ColorHighlighter',
                },
            ],
            settings: {
                closestPoints: true,
                followMode: EFollowMode.permament,
                label: 'Test chart',
                minZoom: 1e-13,
                serverTimeIncrement: 1609459200000000000 as Someseconds,
                serverTimeUnit: EServerTimeUnit.nanosecond,
                url: 'ws://localhost' as TSocketURL,
            },
            type: EPanelType.Charts,
        },
        {
            layouts: [
                {
                    relHeight: 1,
                    relMinHeight: 0.16666666666666666,
                    relMinWidth: 0.16666666666666666,
                    relWidth: 0.3333333333333333,
                    relX: 0.3333333333333333,
                    relY: 0,
                },
            ],
            settings: {
                label: 'Test indicators table',
                serverTimeUnit: EServerTimeUnit.nanosecond,
                url: 'ws://localhost' as TSocketURL,
            },
            table: {
                row: {
                    cell: '',
                },
            },
            type: EPanelType.CustomViewTable,
        },
        {
            grid: {
                cell: '',
            },
            layouts: [
                {
                    relHeight: 1,
                    relMinHeight: 0.16666666666666666,
                    relMinWidth: 0.16666666666666666,
                    relWidth: 0.3333333333333333,
                    relX: 0.6666666666666666,
                    relY: 0,
                },
            ],
            settings: {
                label: 'Test indicators grid',
                serverTimeUnit: EServerTimeUnit.nanosecond,
                url: 'ws://localhost' as TSocketURL,
            },
            type: EPanelType.CustomViewGrid,
        },
    ],
    version: '0.0.0' as TSemverVersion,
};

const Templates = `<dashboard>
  <name>panels_with_type.xml</name>
  <grid>
    <name>80x45</name>
    <cols_count>80</cols_count>
    <rows_count>45</rows_count>
    <margin>8</margin>
    <panel>
      <rel_width>0.2</rel_width>
      <rel_height>0.2</rel_height>
      <rel_min_width>0.2</rel_min_width>
      <rel_min_height>0.2</rel_min_height>
    </panel>
  </grid>
  <panels>
    <panel>
      <type>CustomViewTable</type>
      <settings>
        <url>ws://localhost</url>
        <label>Test indicators table</label>
        <server_time_unit>nanosecond</server_time_unit>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0.3333333333333333</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <table>
        <scope>
          function someNumber() {
             return 3100156;
          }
        </scope>
        <template>
          <name>Test cell template 1</name>
          <parameters>
            <parameter>{indicator 1}</parameter>
          </parameters>
          <text>
            <formula>parseInt(age({ALGO|TEST_RND|01}) + '777', 10) + someNumber()</formula>
          </text>
          <if>
            <condition>age({indicator 1}) > someNumber()</condition>
            <style>
              <color>red</color>
              <background_color>black</background_color>
            </style>
          </if>
        </template>
        <template>
          <name>Test cell template 2</name>
          <parameters>
            <parameter>{indicator 1}</parameter>
            <parameter>{indicator 2}</parameter>
          </parameters>
          <text>
            <formula>parseInt(age({ALGO|TEST_RND|01}) + '777', 10) + someNumber()</formula>
          </text>
          <if>
            <condition>age({indicator 1}) > someNumber()</condition>
            <style>
              <color>red</color>
              <background_color>black</background_color>
            </style>
          </if>
        </template>
        <row>
          <cell>
            <use_template>
              <name>Test cell template 1</name>
              <parameters>
                <parameter>{ALGO|TEST_RND|01#1}</parameter>
              </parameters>
            </use_template>
          </cell>
          <cell>
            <use_template>
              <name>Test cell template 2</name>
              <parameters>
                <parameter>{ALGO|TEST_RND|02#1}</parameter>
                <parameter>{ALGO|TEST_RND|02#2}</parameter>
              </parameters>
            </use_template>
            <text>Level 1.3</text>
          </cell>
        </row>
      </table>
    </panel>
    <panel>
      <type>CustomViewGrid</type>
      <settings>
        <url>ws://localhost</url>
        <label>Test indicators grid</label>
        <server_time_unit>nanosecond</server_time_unit>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0.6666666666666666</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <grid>
        <scope>
          function someNumber() {
             return 3100156;
          }
        </scope>
        <template>
          <name>Test cell template 1</name>
          <parameters>
            <parameter>{indicator 1}</parameter>
          </parameters>
          <text>
            <formula>parseInt(age({ALGO|TEST_RND|01}) + '777', 10) + someNumber()</formula>
          </text>
          <if>
            <condition>age({indicator 1}) > someNumber()</condition>
            <style>
              <color>red</color>
              <background_color>black</background_color>
            </style>
          </if>
        </template>
        <cell>
          <use_template>
            <name>Test cell template 1</name>
            <parameters>
              <parameter>{ALGO|TEST_RND|01}</parameter>
            </parameters>
          </use_template>
        </cell>
      </grid>
    </panel>
  </panels>
</dashboard>` as TStorageDashboardConfig;
const TemplatesDashboard: DeepPartial<TDashboard> = {
    activeLayout: undefined,
    version: '0.0.0' as TSemverVersion,
    name: 'panels_with_type.xml' as TStorageDashboardName,
    grid: {
        colsCount: 240,
        rowsCount: 180,
        margin: 4,
        name: '80x45',
        panel: {
            relWidth: 0.16666666666666666,
            relHeight: 0.16666666666666669,
            relMinWidth: 0.2,
            relMinHeight: 0.2,
        },
    },
    panels: [
        {
            type: EPanelType.CustomViewTable,
            settings: {
                url: 'ws://localhost' as TSocketURL,
                label: 'Test indicators table',
                serverTimeUnit: EServerTimeUnit.nanosecond,
            },
            table: {
                scope: 'function someNumber() {\n             return 3100156;\n          }',
                template: [
                    {
                        name: 'Test cell template 1',
                        parameters: { parameter: '{indicator 1}' },
                        text: {
                            formula: "parseInt(age({ALGO|TEST_RND|01}) + '777', 10) + someNumber()",
                        },
                        if: {
                            condition: 'age({indicator 1}) > someNumber()',
                            style: { color: 'red', backgroundColor: 'black' },
                        },
                    },
                    {
                        name: 'Test cell template 2',
                        parameters: { parameter: ['{indicator 1}', '{indicator 2}'] },
                        text: {
                            formula: "parseInt(age({ALGO|TEST_RND|01}) + '777', 10) + someNumber()",
                        },
                        if: {
                            condition: 'age({indicator 1}) > someNumber()',
                            style: { color: 'red', backgroundColor: 'black' },
                        },
                    },
                ],
                row: {
                    cell: [
                        {
                            useTemplate: {
                                name: 'Test cell template 1',
                                parameters: { parameter: '{ALGO|TEST_RND|01#1}' },
                            },
                        },
                        {
                            useTemplate: {
                                name: 'Test cell template 2',
                                parameters: {
                                    parameter: ['{ALGO|TEST_RND|02#1}', '{ALGO|TEST_RND|02#2}'],
                                },
                            },
                            text: 'Level 1.3',
                        },
                    ],
                },
            },
            layouts: [
                {
                    relHeight: 1,
                    relMinHeight: 0.16666666666666666,
                    relMinWidth: 0.16666666666666666,
                    relWidth: 0.3333333333333333,
                    relX: 0.3333333333333333,
                    relY: 0,
                },
            ],
        },
        {
            type: EPanelType.CustomViewGrid,
            settings: {
                url: 'ws://localhost' as TSocketURL,
                label: 'Test indicators grid',
                serverTimeUnit: EServerTimeUnit.nanosecond,
            },
            grid: {
                scope: 'function someNumber() {\n             return 3100156;\n          }',
                template: {
                    name: 'Test cell template 1',
                    parameters: { parameter: '{indicator 1}' },
                    text: {
                        formula: "parseInt(age({ALGO|TEST_RND|01}) + '777', 10) + someNumber()",
                    },
                    if: {
                        condition: 'age({indicator 1}) > someNumber()',
                        style: { color: 'red', backgroundColor: 'black' },
                    },
                },
                cell: {
                    useTemplate: {
                        name: 'Test cell template 1',
                        parameters: { parameter: '{ALGO|TEST_RND|01}' },
                    },
                },
            },
            layouts: [
                {
                    relX: 0.6666666666666666,
                    relY: 0,
                    relWidth: 0.3333333333333333,
                    relHeight: 1,
                    relMinWidth: 0.16666666666666666,
                    relMinHeight: 0.16666666666666666,
                },
            ],
        },
    ],
};

const WithType = `<dashboard>
  <name>panels_with_type.xml</name>
  <grid>
    <name>80x45</name>
    <cols_count>80</cols_count>
    <rows_count>45</rows_count>
    <margin>8</margin>
    <panel>
      <rel_width>0.2</rel_width>
      <rel_height>0.2</rel_height>
      <rel_min_width>0.2</rel_min_width>
      <rel_min_height>0.2</rel_min_height>
    </panel>
  </grid>
  <panels>
    <panel>
      <type>Charts</type>
      <settings>
        <url>ws://localhost</url>
        <min_zoom>1e-13</min_zoom>
        <follow_mode>permament</follow_mode>
        <closest_points>true</closest_points>
        <server_time_unit>nanosecond</server_time_unit>
        <server_time_increment>1609459200000000000</server_time_increment>
        <label>Test chart</label>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <charts>
        <chart>
          <id>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</id>
          <query>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</query>
          <label>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</label>
          <label_format>%s: %.4g</label_format>
          <type>points</type>
          <point_size>4</point_size>
          <color>8913151</color>
          <opacity>1</opacity>
          <y_axis>left</y_axis>
          <width>4</width>
        </chart>
        <chart>
          <id>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</id>
          <query>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</query>
          <label>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</label>
          <label_format>%s: %.4g</label_format>
          <type>lines</type>
          <width>1</width>
          <color>35071</color>
          <opacity>1</opacity>
          <y_axis>left</y_axis>
        </chart>
        <chart>
          <id>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</id>
          <query>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</query>
          <label>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</label>
          <label_format>%s: %.4g</label_format>
          <type>stairs</type>
          <width>1</width>
          <color>16746496</color>
          <opacity>1</opacity>
          <y_axis>right</y_axis>
        </chart>
        <chart>
          <id>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</id>
          <query>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</query>
          <label>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</label>
          <label_format>%s: %.4g</label_format>
          <type>points</type>
          <point_size>4</point_size>
          <color>16711816</color>
          <opacity>1</opacity>
          <y_axis>right</y_axis>
          <style_converter>ColorHighlighter</style_converter>
          <width>4</width>
        </chart>
      </charts>
      <schemes>
        <scheme>
          <element>
            <from>3000</from>
            <text>rgba(255, 128, 0, 128)</text>
          </element>
          <element>
            <from>2000</from>
            <to>3000</to>
            <text>rgba(0, 255, 128, 128)</text>
          </element>
          <element>
            <text>rgba(255, 0, 128, 128)</text>
          </element>
          <name>ColorHighlighter</name>
        </scheme>
      </schemes>
    </panel>
    <panel>
      <type>CustomViewTable</type>
      <settings>
        <url>ws://localhost</url>
        <label>Test indicators table</label>
        <server_time_unit>nanosecond</server_time_unit>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0.3333333333333333</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <table>
        <row>
          <cell />
        </row>
      </table>
    </panel>
    <panel>
      <type>CustomViewGrid</type>
      <settings>
        <url>ws://localhost</url>
        <label>Test indicators grid</label>
        <server_time_unit>nanosecond</server_time_unit>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0.6666666666666666</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <grid>
        <cell />
      </grid>
    </panel>
  </panels>
</dashboard>` as TStorageDashboardConfig;
const WithTypeDashboard: DeepPartial<TDashboard> = {
    activeLayout: undefined,
    version: '0.0.0' as TSemverVersion,
    name: 'panels_with_type.xml' as TStorageDashboardName,
    grid: {
        colsCount: 240,
        rowsCount: 180,
        margin: 4,
        name: '80x45',
        panel: {
            relWidth: 0.16666666666666666,
            relHeight: 0.16666666666666669,
            relMinWidth: 0.2,
            relMinHeight: 0.2,
        },
    },
    panels: [
        {
            type: EPanelType.Charts,
            settings: {
                url: 'ws://localhost' as TSocketURL,
                minZoom: 1e-13,
                followMode: EFollowMode.permament,
                closestPoints: true,
                serverTimeUnit: EServerTimeUnit.nanosecond,
                serverTimeIncrement: 1609459200000000000 as Someseconds,
                label: 'Test chart',
            },
            charts: [
                {
                    query: "indicators{name='BTC-ETH|UpbitSpot.l1.ask'}" as TPromqlQuery,
                    label: "indicators{name='BTC-ETH|UpbitSpot.l1.ask'}",
                    labelFormat: '%s: %.4g',
                    type: EChartType.points,
                    pointSize: 4,
                    color: '#8800ff',
                    opacity: 1,
                    yAxis: EVirtualViewport.left,
                    width: 4,
                },
                {
                    query: "indicators{name='KRW-ETH|UpbitSpot.l1.ask'}" as TPromqlQuery,
                    label: "indicators{name='KRW-ETH|UpbitSpot.l1.ask'}",
                    labelFormat: '%s: %.4g',
                    type: EChartType.lines,
                    width: 1,
                    color: '#0088ff',
                    opacity: 1,
                    yAxis: EVirtualViewport.left,
                },
                {
                    query: "indicators{name='BTC-ETH|UpbitSpot.l1.bid'}" as TPromqlQuery,
                    label: "indicators{name='BTC-ETH|UpbitSpot.l1.bid'}",
                    labelFormat: '%s: %.4g',
                    type: EChartType.stairs,
                    width: 1,
                    color: '#ff8800',
                    opacity: 1,
                    yAxis: EVirtualViewport.right,
                },
                {
                    query: "indicators{name='KRW-ETH|UpbitSpot.l1.bid'}" as TPromqlQuery,
                    label: "indicators{name='KRW-ETH|UpbitSpot.l1.bid'}",
                    labelFormat: '%s: %.4g',
                    type: EChartType.points,
                    pointSize: 4,
                    color: '#ff0088',
                    opacity: 1,
                    yAxis: EVirtualViewport.right,
                    styleConverter: 'ColorHighlighter',
                    width: 4,
                },
            ],
            schemes: [
                {
                    element: [
                        { from: 3000, text: 'rgba(255, 128, 0, 128)' },
                        { from: 2000, to: 3000, text: 'rgba(0, 255, 128, 128)' },
                        { text: 'rgba(255, 0, 128, 128)' },
                    ],
                    name: 'ColorHighlighter',
                },
            ],
            layouts: [
                {
                    relX: 0,
                    relY: 0,
                    relWidth: 0.3333333333333333,
                    relHeight: 1,
                    relMinWidth: 0.16666666666666666,
                    relMinHeight: 0.16666666666666666,
                },
            ],
        },
        {
            type: EPanelType.CustomViewTable,
            settings: {
                url: 'ws://localhost' as TSocketURL,
                label: 'Test indicators table',
                serverTimeUnit: EServerTimeUnit.nanosecond,
            },
            table: { row: { cell: '' } },

            layouts: [
                {
                    relX: 0.3333333333333333,
                    relY: 0,
                    relWidth: 0.3333333333333333,
                    relHeight: 1,
                    relMinWidth: 0.16666666666666666,
                    relMinHeight: 0.16666666666666666,
                },
            ],
        },
        {
            type: EPanelType.CustomViewGrid,
            settings: {
                url: 'ws://localhost' as TSocketURL,
                label: 'Test indicators grid',
                serverTimeUnit: EServerTimeUnit.nanosecond,
            },
            grid: { cell: '' },
            layouts: [
                {
                    relX: 0.6666666666666666,
                    relY: 0,
                    relWidth: 0.3333333333333333,
                    relHeight: 1,
                    relMinWidth: 0.16666666666666666,
                    relMinHeight: 0.16666666666666666,
                },
            ],
        },
    ],
};

const WithoutType = `<dashboard>
  <name>panels_without_type.xml</name>
  <grid>
    <name>80x45</name>
    <cols_count>80</cols_count>
    <rows_count>45</rows_count>
    <margin>8</margin>
    <panel>
      <rel_width>0.2</rel_width>
      <rel_height>0.2</rel_height>
      <rel_min_width>0.2</rel_min_width>
      <rel_min_height>0.2</rel_min_height>
    </panel>
  </grid>
  <panels>
    <panel>
      <settings>
        <url>ws://localhost</url>
        <min_zoom>1e-13</min_zoom>
        <follow_mode>permament</follow_mode>
        <closest_points>true</closest_points>
        <server_time_unit>nanosecond</server_time_unit>
        <server_time_increment>1609459200000000000</server_time_increment>
        <label>Test chart</label>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <charts>
        <chart>
          <id>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</id>
          <query>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</query>
          <label>indicators{name='BTC-ETH|UpbitSpot.l1.ask'}</label>
          <label_format>%s: %.4g</label_format>
          <type>points</type>
          <point_size>4</point_size>
          <color>8913151</color>
          <opacity>1</opacity>
          <y_axis>left</y_axis>
          <width>4</width>
        </chart>
        <chart>
          <id>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</id>
          <query>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</query>
          <label>indicators{name='KRW-ETH|UpbitSpot.l1.ask'}</label>
          <label_format>%s: %.4g</label_format>
          <type>lines</type>
          <width>1</width>
          <color>35071</color>
          <opacity>1</opacity>
          <y_axis>left</y_axis>
        </chart>
        <chart>
          <id>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</id>
          <query>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</query>
          <label>indicators{name='BTC-ETH|UpbitSpot.l1.bid'}</label>
          <label_format>%s: %.4g</label_format>
          <type>stairs</type>
          <width>1</width>
          <color>16746496</color>
          <opacity>1</opacity>
          <y_axis>right</y_axis>
        </chart>
        <chart>
          <id>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</id>
          <query>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</query>
          <label>indicators{name='KRW-ETH|UpbitSpot.l1.bid'}</label>
          <label_format>%s: %.4g</label_format>
          <type>points</type>
          <point_size>4</point_size>
          <color>16711816</color>
          <opacity>1</opacity>
          <y_axis>right</y_axis>
          <style_converter>ColorHighlighter</style_converter>
          <width>4</width>
        </chart>
      </charts>
      <schemes>
        <scheme>
          <element>
            <from>3000</from>
            <text>rgba(255, 128, 0, 128)</text>
          </element>
          <element>
            <from>2000</from>
            <to>3000</to>
            <text>rgba(0, 255, 128, 128)</text>
          </element>
          <element>
            <text>rgba(255, 0, 128, 128)</text>
          </element>
          <name>ColorHighlighter</name>
        </scheme>
      </schemes>
    </panel>
    <panel>
      <settings>
        <url>ws://localhost</url>
        <label>Test indicators table</label>
        <server_time_unit>nanosecond</server_time_unit>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0.3333333333333333</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <table>
        <header>
          <column>
            <text>Header2.0</text>
            <width>100</width>
          </column>
          <column>
            <width>200</width>
          </column>
          <column>
            <text>Header3</text>
            <width>100</width>
          </column>
          <column>
            <text>Header4</text>
            <width>100</width>
          </column>
        </header>
        <row>
          <style>
            <background_color>Aquamarine</background_color>
          </style>
          <if>
            <condition>{ALGO|TEST_RND|01} > 500</condition>
            <style>
              <background_color>green</background_color>
            </style>
          </if>
          <cell>
            <text>Level 1.1</text>
          </cell>
          <cell>
            <text>Level 1.2</text>
            <style>
              <text_align>center</text_align>
              <margin>30px</margin>
            </style>
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
                  <condition>{ALGO|TEST_RND|02} > 500</condition>
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
    </panel>
    <panel>
      <settings>
        <url>ws://localhost</url>
        <label>Test indicators grid</label>
        <server_time_unit>nanosecond</server_time_unit>
        <do-not-initialize-charts>true</do-not-initialize-charts>
      </settings>
      <layout>
        <rel_width>0.3333333333333333</rel_width>
        <rel_height>1</rel_height>
        <rel_min_width>0.16666666666666666</rel_min_width>
        <rel_min_height>0.16666666666666666</rel_min_height>
        <rel_x>0.6666666666666666</rel_x>
        <rel_y>0</rel_y>
      </layout>
      <grid>
        <style>
          <gap>20px</gap>
        </style>
        <if>
          <condition>{ALGO|TEST_RND|00} > 500</condition>
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
    </panel>
  </panels>
</dashboard>` as TStorageDashboardConfig;
const WithoutTypeDashboard: DeepPartial<TDashboard> = {
    activeLayout: undefined,
    version: '0.0.0' as TSemverVersion,
    name: 'panels_without_type.xml' as TStorageDashboardName,
    grid: {
        colsCount: 240,
        rowsCount: 180,
        margin: 4,
        name: '80x45',
        panel: {
            relWidth: 0.16666666666666666,
            relHeight: 0.16666666666666669,
            relMinWidth: 0.2,
            relMinHeight: 0.2,
        },
    },
    panels: [
        {
            type: EPanelType.Charts,
            settings: {
                url: 'ws://localhost' as TSocketURL,
                minZoom: 1e-13,
                followMode: EFollowMode.permament,
                closestPoints: true,
                serverTimeUnit: EServerTimeUnit.nanosecond,
                serverTimeIncrement: 1609459200000000000 as Someseconds,
                label: 'Test chart',
            },
            charts: [
                {
                    query: "indicators{name='BTC-ETH|UpbitSpot.l1.ask'}" as TPromqlQuery,
                    label: "indicators{name='BTC-ETH|UpbitSpot.l1.ask'}",
                    labelFormat: '%s: %.4g',
                    type: EChartType.points,
                    pointSize: 4,
                    color: '#8800ff',
                    opacity: 1,
                    yAxis: EVirtualViewport.left,
                    width: 4,
                },
                {
                    query: "indicators{name='KRW-ETH|UpbitSpot.l1.ask'}" as TPromqlQuery,
                    label: "indicators{name='KRW-ETH|UpbitSpot.l1.ask'}",
                    labelFormat: '%s: %.4g',
                    type: EChartType.lines,
                    width: 1,
                    color: '#0088ff',
                    opacity: 1,
                    yAxis: EVirtualViewport.left,
                },
                {
                    query: "indicators{name='BTC-ETH|UpbitSpot.l1.bid'}" as TPromqlQuery,
                    label: "indicators{name='BTC-ETH|UpbitSpot.l1.bid'}",
                    labelFormat: '%s: %.4g',
                    type: EChartType.stairs,
                    width: 1,
                    color: '#ff8800',
                    opacity: 1,
                    yAxis: EVirtualViewport.right,
                },
                {
                    query: "indicators{name='KRW-ETH|UpbitSpot.l1.bid'}" as TPromqlQuery,
                    label: "indicators{name='KRW-ETH|UpbitSpot.l1.bid'}",
                    labelFormat: '%s: %.4g',
                    type: EChartType.points,
                    pointSize: 4,
                    color: '#ff0088',
                    opacity: 1,
                    yAxis: EVirtualViewport.right,
                    styleConverter: 'ColorHighlighter',
                    width: 4,
                },
            ],
            schemes: [
                {
                    element: [
                        { from: 3000, text: 'rgba(255, 128, 0, 128)' },
                        { from: 2000, to: 3000, text: 'rgba(0, 255, 128, 128)' },
                        { text: 'rgba(255, 0, 128, 128)' },
                    ],
                    name: 'ColorHighlighter',
                },
            ],
            layouts: [
                {
                    relX: 0,
                    relY: 0,
                    relWidth: 0.3333333333333333,
                    relHeight: 1,
                    relMinWidth: 0.16666666666666666,
                    relMinHeight: 0.16666666666666666,
                },
            ],
        },
        {
            type: EPanelType.CustomViewTable,
            settings: {
                url: 'ws://localhost' as TSocketURL,
                label: 'Test indicators table',
                serverTimeUnit: EServerTimeUnit.nanosecond,
            },
            table: {
                header: {
                    column: [
                        { text: 'Header2.0', width: 100 },
                        { width: 200 },
                        { text: 'Header3', width: 100 },
                        { text: 'Header4', width: 100 },
                    ],
                },
                row: {
                    style: { backgroundColor: 'Aquamarine' },
                    if: {
                        condition: '{ALGO|TEST_RND|01} > 500',
                        style: { backgroundColor: 'green' },
                    },
                    cell: [
                        { text: 'Level 1.1' },
                        { text: 'Level 1.2', style: { textAlign: 'center', margin: '30px' } },
                        {
                            text: {
                                format: 'ALGO|TEST_RND|01 age: %g seconds',
                                formula: 'age({ALGO|TEST_RND|01})',
                            },
                        },
                        {
                            text: { format: 'Base text: %g', formula: '{ALGO|TEST_RND|01}' },
                            style: { backgroundColor: 'blue' },
                            mark: { style: { color: 'white' } },
                            if: {
                                condition: '{ALGO|TEST_RND|02} > 900000',
                                style: {
                                    backgroundColor: 'red',
                                    border: '3px solid black',
                                    borderRadius: '10px',
                                },
                                text: {
                                    format: 'Changed label: %g',
                                    formula: '{ALGO|TEST_RND|02}',
                                },
                                tooltip: 'Foo',
                                mark: { style: { color: 'black', width: '30px', height: '30px' } },
                            },
                        },
                    ],
                    row: {
                        cell: [
                            { text: 'Level 2.1' },
                            { text: 'Level 2.2' },
                            {
                                text: {
                                    format: 'ALGO|TEST_RND|02 age: %g seconds',
                                    formula: 'age({ALGO|TEST_RND|02})',
                                },
                            },
                        ],
                        row: {
                            style: { backgroundColor: 'Aquamarine' },
                            if: {
                                condition: 'age({ALGO|TEST_RND|01}) > 265130',
                                style: { backgroundColor: 'green' },
                            },
                            cell: [
                                { text: 'Some text 1' },
                                { text: 'Some text 2' },
                                {
                                    text: {
                                        format: 'ALGO|TEST_RND|01 age: %g seconds',
                                        formula: 'age({ALGO|TEST_RND|01})',
                                    },
                                },
                                {
                                    text: {
                                        format: 'Base text: %g',
                                        formula: '{ALGO|TEST_RND|01}',
                                    },
                                    style: { backgroundColor: 'blue' },
                                    mark: { style: { color: 'white' } },
                                    if: {
                                        condition: '{ALGO|TEST_RND|02} > 500',
                                        style: {
                                            backgroundColor: 'red',
                                            border: '3px solid black',
                                            borderRadius: '10px',
                                        },
                                        text: {
                                            format: 'Changed label: %g',
                                            formula: '{ALGO|TEST_RND|02}',
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
                            row: {
                                cell: [
                                    { text: 'ROW 2: Some text 1' },
                                    { text: 'ROW 2: Some text 2' },
                                    {
                                        text: {
                                            format: 'ALGO|TEST_RND|02 age: %g seconds',
                                            formula: 'age({ALGO|TEST_RND|02})',
                                        },
                                    },
                                ],
                            },
                        },
                    },
                },
            },
            layouts: [
                {
                    relX: 0.3333333333333333,
                    relY: 0,
                    relWidth: 0.3333333333333333,
                    relHeight: 1,
                    relMinWidth: 0.16666666666666666,
                    relMinHeight: 0.16666666666666666,
                },
            ],
        },
        {
            type: EPanelType.CustomViewGrid,
            settings: {
                url: 'ws://localhost' as TSocketURL,
                label: 'Test indicators grid',
                serverTimeUnit: EServerTimeUnit.nanosecond,
            },
            grid: {
                style: { gap: '20px' },
                if: { condition: '{ALGO|TEST_RND|00} > 500', style: { backgroundColor: 'green' } },
                cell: [
                    {
                        column: 1,
                        text: { format: 'Base text: %g', formula: '{ALGO|TEST_RND|01}' },
                        style: { backgroundColor: 'blue' },
                        mark: { style: { color: 'white' } },
                        if: {
                            condition: '{ALGO|TEST_RND|02} > 500',
                            style: {
                                backgroundColor: 'red',
                                border: '3px solid black',
                                borderRadius: '10px',
                            },
                            tooltip: 'Foo',
                            text: { format: 'Changed label: %g', formula: '{ALGO|TEST_RND|01}' },
                            mark: { style: { color: 'black', width: '30px', height: '30px' } },
                        },
                    },
                    {
                        column: 3,
                        text: { format: 'Base text: %g', formula: '{ALGO|TEST_RND|01}' },
                        style: { backgroundColor: 'blue' },
                        mark: { style: { color: 'white' } },
                        if: { condition: '{ALGO|TEST_RND|02} > 500', style: { display: 'none' } },
                    },
                    {
                        column: 5,
                        text: {
                            format: 'Base text: %g seconds',
                            formula: 'age({ALGO|TEST_RND|01})',
                        },
                        style: { backgroundColor: 'blue' },
                        mark: { style: { color: 'white' } },
                        if: {
                            condition: '{ALGO|TEST_RND|02} > 500',
                            style: {
                                backgroundColor: 'red',
                                border: '3px solid black',
                                borderRadius: '10px',
                            },
                            tooltip: 'Foo',
                            text: {
                                format: 'Changed label: %g seconds',
                                formula: 'age({ALGO|TEST_RND|01})',
                            },
                            mark: { style: { color: 'black', width: '30px', height: '30px' } },
                        },
                    },
                ],
            },
            layouts: [
                {
                    relX: 0.6666666666666666,
                    relY: 0,
                    relWidth: 0.3333333333333333,
                    relHeight: 1,
                    relMinWidth: 0.16666666666666666,
                    relMinHeight: 0.16666666666666666,
                },
            ],
        },
    ],
};

export const PositiveCases: [TStorageDashboardConfig, DeepPartial<TDashboard>][] = [
    [Simple, SimpleDashboard],
    [Templates, TemplatesDashboard],
    [WithType, WithTypeDashboard],
    [WithoutType, WithoutTypeDashboard],
];
