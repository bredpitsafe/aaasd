import { styleModalContent, styleModalContentBody } from '../../components/Modals';
import { style } from '../../utils/css/style.css';

export const cnModal = style({
    width: '90vw!important',
});

styleModalContent(cnModal, {
    height: '90vh',
    position: 'relative',
});

styleModalContentBody(cnModal, {
    width: '100%',
    height: '100%',
});
