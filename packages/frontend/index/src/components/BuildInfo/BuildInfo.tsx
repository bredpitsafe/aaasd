import type { TWithClassname } from '@frontend/common/src/types/components.ts';

export const BuildInfo = (props: TWithClassname) => {
    return <div className={props.className}>v{process.env.npm_package_version}</div>;
};
