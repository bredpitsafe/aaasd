import { UIElement } from '../ui-element';

const FIXTURES_FOLDER = 'cypress/fixtures/dashboard/';

export class UploadFile extends UIElement {
    uploadFile(filename: string): void {
        this.get()
            .first()
            .selectFile(FIXTURES_FOLDER + filename, { force: true });
    }
}
