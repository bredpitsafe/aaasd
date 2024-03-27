import { buildStorageExportUrl } from '../../../utils/url';

export function openWindowDashboardExportStorage(domain: string): Window | null {
    return window.open(buildStorageExportUrl(domain), '', 'height=200,width=400,scrollbars=no');
}
