import type { ReactElement } from 'react';
import { useCallback } from 'react';

import { useModule } from '../../di/react';
import { ModuleLayouts } from '../../modules/layouts';
import { Form } from '../Form';
import { Input } from '../Input';
import { Overlay } from '../overlays/Overlay';
import { cnFrame } from './ConnectedFrame.css';

type TConnectedFrameProps = {
    id: string;
    url?: string;
};

export function ConnectedFrame(props: TConnectedFrameProps): ReactElement {
    const { updateTab } = useModule(ModuleLayouts);
    const { id, url } = props;

    const cbSubmit = useCallback(
        (values: { url: string }) => {
            void updateTab(id, {
                config: {
                    url: values.url,
                },
            });
        },
        [id, updateTab],
    );

    return url ? (
        <iframe className={cnFrame} src={url} />
    ) : (
        <Overlay>
            <Form onFinish={cbSubmit}>
                <Form.Item name="url">
                    <Input placeholder="Enter URL" type="url" />
                </Form.Item>
            </Form>
        </Overlay>
    );
}
