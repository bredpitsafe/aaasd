import 'antd/dist/reset.css';
import '@frontend/common/src/components/index.css';

import type { TContextRef } from '@frontend/common/src/di';
import cn from 'classnames';
import { memo, useState } from 'react';

import { cnMenu, cnMenuItem, cnMenuTitle, cnMenuTitleActive } from './App.css';
import { CharterTab } from './charter';
import { GeneratorTab } from './generator';
import { IndicatorsTab } from './indicators';

export const App = memo(({ ctx }: { ctx: TContextRef }) => {
    const [application, setApplication] = useState('charter');
    return (
        <div>
            <ul className={cnMenu}>
                <li className={cnMenuItem}>
                    <a
                        className={cn(cnMenuTitle, {
                            [cnMenuTitleActive]: application === 'charter',
                        })}
                        onClick={() => setApplication('charter')}
                    >
                        Charter
                    </a>
                </li>
                <li className={cnMenuItem}>
                    <a
                        className={cn(cnMenuTitle, {
                            [cnMenuTitleActive]: application === 'indicators',
                        })}
                        onClick={() => setApplication('indicators')}
                    >
                        Indicators
                    </a>
                </li>
                <li className={cnMenuItem}>
                    <a
                        className={cn(cnMenuTitle, {
                            [cnMenuTitleActive]: application === 'generator',
                        })}
                        onClick={() => setApplication('generator')}
                    >
                        Generator
                    </a>
                </li>
            </ul>
            {application === 'charter' && <CharterTab />}
            {application === 'indicators' && <IndicatorsTab ctx={ctx} />}
            {application === 'generator' && <GeneratorTab ctx={ctx} />}
        </div>
    );
});
