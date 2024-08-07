import type { TimeZone } from '@common/types';
import { isNil } from 'lodash-es';
import type { ReactElement } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { from } from 'rxjs';
import { tap } from 'rxjs/operators';

import type { TConfigRevision } from '../../modules/actions/config/ModuleFetchConfigRevision.ts';
import type { TConfigRevisionLookup } from '../../modules/actions/config/ModuleFetchConfigRevisions';
import { useFunction } from '../../utils/React/useFunction';
import { RevisionSelector } from './components/ConfigActions';
import type { TConfigFullEditorProps } from './ConfigFullEditor';
import { ConfigFullEditor } from './ConfigFullEditor';
import type { EConfigEditorLanguages } from './types';

type TConfigFullEditorWithRevisionsProps = TConfigFullEditorProps & {
    configDigest: undefined | string;
    revisionDigest: undefined | string;
    loadRevision: (digest: string) => Promise<TConfigRevision | undefined>;
    loadRevisions: () => Promise<TConfigRevisionLookup[] | undefined>;
    onRevisionDigestChanged: (digest: undefined | string) => void;
    timeZone: TimeZone;
};
export function ConfigFullEditorWithRevisions(
    props: TConfigFullEditorWithRevisionsProps,
): ReactElement {
    const {
        revisionDigest,
        configDigest,
        loadRevision,
        loadRevisions,
        onRevisionDigestChanged,
        onDiscard,
        onApply,
        timeZone,
        ...fullEditorProps
    } = props;

    const { onChangeValue, value, modifiedValue } = props;
    const [loading, setLoading] = useState(true);
    const [revisions, setRevisions] = useState<TConfigRevisionLookup[] | undefined>(undefined);

    useEffect(() => {
        setLoading(true);
        const subscription = from(loadRevisions())
            .pipe(tap((list) => setLoading(isNil(list))))
            .subscribe(setRevisions);

        return () => subscription.unsubscribe();
    }, [loadRevisions]);

    const revisionDigestFixed = useMemo(() => {
        if (isNil(revisions)) {
            return undefined;
        }

        return isNil(revisionDigest) ||
            (revisionDigest !== configDigest &&
                revisions.some(({ digest }) => digest === revisionDigest))
            ? revisionDigest
            : undefined;
    }, [revisions, revisionDigest, configDigest]);

    const updateDigestAndConfig = useFunction((digest: string | undefined, config?: string) => {
        if (isNil(modifiedValue) || value === modifiedValue) {
            onChangeValue?.(config ?? value);
        }
    });

    useEffect(() => {
        if (isNil(revisionDigestFixed)) {
            return;
        }

        if (revisionDigestFixed === configDigest) {
            updateDigestAndConfig(undefined);
            return;
        }

        const subscription = from(loadRevision(revisionDigestFixed))
            .pipe(
                tap((revision) => {
                    setLoading(isNil(revision));
                }),
            )
            .subscribe((revision) => {
                if (isNil(revision)) {
                    return;
                }
                updateDigestAndConfig(revisionDigestFixed, revision?.config ?? '');
            });

        return () => subscription.unsubscribe();
    }, [loadRevision, revisionDigestFixed, configDigest, updateDigestAndConfig]);

    const handleDiscard = useFunction(() => {
        onDiscard?.();
        onRevisionDigestChanged(undefined);
    });

    const userRevisionChanged = useFunction((digest: undefined | string) => {
        onChangeValue?.(value);
        onRevisionDigestChanged(digest === configDigest ? undefined : digest);
    });

    const handleApply = useFunction(async (value: string, lang: EConfigEditorLanguages) => {
        if ((await onApply?.(value, lang)) !== false) {
            onRevisionDigestChanged(undefined);
        }
    });

    return (
        <ConfigFullEditor
            {...fullEditorProps}
            selection={loading ? undefined : fullEditorProps.selection}
            highlightLines={loading ? undefined : fullEditorProps.highlightLines}
            onApply={handleApply}
            onDiscard={handleDiscard}
        >
            <RevisionSelector
                currentDigest={loading ? undefined : revisionDigestFixed ?? configDigest}
                revisions={revisions}
                loading={loading}
                onChange={userRevisionChanged}
                timeZone={timeZone}
            />
        </ConfigFullEditor>
    );
}
