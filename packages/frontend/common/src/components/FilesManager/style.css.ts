import { style } from '../../utils/css/style.css';
import { styleModalContent, styleModalContentBody } from '../Modals';

export const cnModal = style({
    top: '5%',
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
});

export const cnEditor = style({
    height: '100%',
    /**
     * WORKAROUND: The Ant Modal component has a 'word-wrap: break-word' property
     * that causes a rendering bug in the Monaco Editor's line numbers.
     */
    wordWrap: 'initial',
});
