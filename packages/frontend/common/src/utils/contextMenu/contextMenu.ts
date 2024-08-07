import { cnContextMenuIcon } from './contextMenu.css';

export function createContextMenuIcon(svg: string): string {
    return `<div class="${cnContextMenuIcon}">${svg}</div>`;
}
