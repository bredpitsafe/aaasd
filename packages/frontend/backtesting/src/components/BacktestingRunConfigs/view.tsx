import type { Nil } from '@common/types';
import { ConfigFullEditor } from '@frontend/common/src/components/Editors/ConfigFullEditor';
import {
    EConfigEditorLanguages,
    EConfigEditorMode,
} from '@frontend/common/src/components/Editors/types';
import { Error } from '@frontend/common/src/components/Error/view';
import type { TabsProps } from '@frontend/common/src/components/Tabs';
import { Tabs } from '@frontend/common/src/components/Tabs';
import type { TRobotConfigRecord } from '@frontend/common/src/modules/actions/def.ts';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TRobot } from '@frontend/common/src/types/domain/robots';
import { EMPTY_ARRAY } from '@frontend/common/src/utils/const';
import cn from 'classnames';
import { isEmpty, isNil } from 'lodash-es';
import { memo, useMemo } from 'react';

import { cnConfigEditor, cnTabs } from './view.css';

type TBacktestingRunConfigsProps = TWithClassname & {
    robots: Nil | Pick<TRobot, 'id' | 'name'>[];
    configs: Nil | TRobotConfigRecord;
};
export const BacktestingRunConfigs = memo(
    ({ className, robots, configs }: TBacktestingRunConfigsProps) => {
        const items: TabsProps['items'] = useMemo(
            () =>
                robots?.map(({ id, name }) => {
                    const config = configs?.[id]?.config;
                    return {
                        key: id,
                        label: name,
                        children: isNil(config) ? (
                            <Error status="warning" title="Robot Config is not available" />
                        ) : (
                            <ConfigFullEditor
                                className={cnConfigEditor}
                                language={EConfigEditorLanguages.xml}
                                value={config}
                                viewMode={EConfigEditorMode.single}
                                originalTitle="Saved panel config"
                                modifiedTitle="Edited panel config"
                                readOnly
                            />
                        ),
                    };
                }) ?? EMPTY_ARRAY,
            [robots, configs],
        );

        if (isNil(configs) || isEmpty(configs)) {
            return <Error status="info" title="Run Configs are not available" />;
        }

        return <Tabs className={cn(className, cnTabs)} type="card" size="small" items={items} />;
    },
);
