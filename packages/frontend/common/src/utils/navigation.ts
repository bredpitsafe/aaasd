export function openUrlInNewTab(url: string): Window | null {
    return window.open(url, '_blank', 'noreferrer');
}
