import { orange } from '@ant-design/colors';
import { style } from '@vanilla-extract/css';

import { EDataSourceLevel } from '../modules/dataSourceStatus/defs';
import { red } from './colors';
import { specify } from './css/specify';

export const cnDatasourceStatus: Partial<Record<EDataSourceLevel, string>> = {
    [EDataSourceLevel.Error]: style(
        specify({
            background: red[0],

            vars: {
                ' --ag-header-background-color': red[0],
            },
        }),
    ),
    [EDataSourceLevel.Warning]: style(
        specify({
            background: orange[0],

            vars: {
                ' --ag-header-background-color': orange[0],
            },
        }),
    ),
};
