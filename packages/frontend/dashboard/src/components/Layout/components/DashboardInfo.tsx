import { Result } from '@frontend/common/src/components/Result';

import { cnContainer } from './DashboardInfo.css';

export function DashboardInfo({ title, description }: { title: string; description?: string }) {
    return (
        <div className={cnContainer}>
            <Result status="info" title={title} subTitle={description} />
        </div>
    );
}
