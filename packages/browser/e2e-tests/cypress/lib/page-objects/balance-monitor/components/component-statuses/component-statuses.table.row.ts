import { Text } from '../../../../base/elements/text';
import { ETableBodySelectors, TableRow } from '../../../common/table/table.row';

export enum EComponentStatusesTableSelectors {
    ComponentIDRowText = `${ETableBodySelectors.TableBody} [col-id="componentId"]`,
    DescriptionRowText = `${ETableBodySelectors.TableBody} [col-id="description"]`,
}
export class ComponentStatusesTableRow extends TableRow {
    readonly componentIDRowText = new Text(
        EComponentStatusesTableSelectors.ComponentIDRowText,
        false,
    );
    readonly descriptionRowText = new Text(
        EComponentStatusesTableSelectors.DescriptionRowText,
        false,
    );

    checkDataTable() {
        this.componentIDRowText.checkContain('component');
        this.descriptionRowText.checkContain('period');
    }

    checkContainComponentID(componentID: string) {
        this.checkContainTextInColumn(
            EComponentStatusesTableSelectors.ComponentIDRowText,
            componentID,
        );
    }

    checkContainDescription(description: string) {
        this.checkContainTextInColumn(
            EComponentStatusesTableSelectors.DescriptionRowText,
            description,
        );
    }
}

export const componentStatusesTableRow = new ComponentStatusesTableRow();
