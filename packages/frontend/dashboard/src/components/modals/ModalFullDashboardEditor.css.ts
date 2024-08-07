import { styleModalContent, styleModalContentBody } from '@frontend/common/src/components/Modals';
import { styleTabContent, styleTabPane } from '@frontend/common/src/components/Tabs.css';
import { style } from '@frontend/common/src/utils/css/style.css';

export const cnModal = style({
    top: '5%',
    width: '90%!important',
    height: '90%',
});

styleModalContent(cnModal, {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
});
styleModalContentBody(cnModal, {
    flexGrow: 1,
    padding: '8px 20px 20px 20px',
    overflowY: 'hidden',
});

export const cnTabPane = style({
    height: '100%',
});

export const cnSection = style({
    marginBottom: '12px',
});

export const cnEditor = style({
    height: '100%',
    /**
     * WORKAROUND: The Ant Modal component has a 'word-wrap: break-word' property
     * that causes a rendering bug in the Monaco Editor's line numbers.
     */
    wordWrap: 'initial',
});

export const cnTabs = style({
    height: '100%',
    overflowY: 'hidden',
});
styleTabContent(cnTabs, {
    height: '100%',
});
styleTabPane(cnTabs, {
    fontSize: '12px',
});

export const cnVisualEditorContainer = style({
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
});

export const cnChartsEditorActions = style({
    marginTop: '24px',
});
