// href; https://developer.mozilla.org:8080/en-US/search?q=URL#search-results-close-container
// protocol; https:
// host; developer.mozilla.org:8080
// hostname; developer.mozilla.org
// port; 8080
// pathname; /en-US/search
// search; ?q=URL
// hash; #search-results-close-container
// origin; https://developer.mozilla.org:8080

export function getLocation(
    ...keys: (
        | 'href'
        | 'protocol'
        | 'host'
        | 'hostname'
        | 'port'
        | 'pathname'
        | 'search'
        | 'hash'
        | 'origin'
    )[]
): string {
    return keys.reduce((url, k) => url + location[k] + (k === 'protocol' ? '//' : ''), '');
}
