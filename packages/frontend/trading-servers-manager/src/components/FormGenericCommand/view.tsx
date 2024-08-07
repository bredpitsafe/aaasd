import { Button } from '@frontend/common/src/components/Button';
import { Editor } from '@frontend/common/src/components/Editors/Editor';
import { EConfigEditorLanguages } from '@frontend/common/src/components/Editors/types';
import { useModule } from '@frontend/common/src/di/react';
import { ModuleMessages } from '@frontend/common/src/lib/messages';
import type { TWithClassname } from '@frontend/common/src/types/components';
import type { TStructurallyCloneableObject } from '@frontend/common/src/types/serialization';
import { useFunction } from '@frontend/common/src/utils/React/useFunction';
import { tryDo } from '@frontend/common/src/utils/tryDo';
import cn from 'classnames';
import type { ReactElement } from 'react';
import React from 'react';

import { cnButton, cnEditor, cnRoot } from './view.css';

type TCommandsFormType = TWithClassname & {
    onSend: (v: TStructurallyCloneableObject) => void;
};

export function FormGenericCommand(props: TCommandsFormType): ReactElement {
    const { error } = useModule(ModuleMessages);

    const [value, setValue] = React.useState<string>('');
    const handleClick = useFunction(() => {
        const [err, obj] = tryDo(() => JSON.parse(value));

        if (err) {
            error(`Can't convert to object`);
        }

        if (obj) {
            props.onSend(obj);
        }
    });

    return (
        <div className={cn(props.className, cnRoot)}>
            <Editor
                className={cnEditor}
                language={EConfigEditorLanguages.json}
                value={value}
                onChangeValue={setValue}
            />
            <Button className={cnButton} onClick={handleClick}>
                Send
            </Button>
        </div>
    );
}
