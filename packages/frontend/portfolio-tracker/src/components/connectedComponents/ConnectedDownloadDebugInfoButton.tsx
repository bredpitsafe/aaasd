import { FileSearchOutlined } from '@ant-design/icons';
import { Button } from '@frontend/common/src/components/Button';
import { useModule } from '@frontend/common/src/di/react';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { generateTraceId } from '@frontend/common/src/utils/traceId';
import { ComponentProps } from 'react';

import { ModulePortfolioTrackerActions } from '../../modules/actions/module';

export function ConnectedDownloadDebugInfoButton(props: ComponentProps<typeof Button>) {
    const { downloadCurrentPortfolioDebugInfo$ } = useModule(ModulePortfolioTrackerActions);
    const onClick = useFunction((event) => {
        downloadCurrentPortfolioDebugInfo$(generateTraceId());
        props.onClick?.(event);
    });

    return (
        <Button {...props} onClick={onClick} icon={<FileSearchOutlined />}>
            {props.children}
        </Button>
    );
}
