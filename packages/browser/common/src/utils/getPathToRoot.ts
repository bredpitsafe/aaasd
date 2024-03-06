import { getLocation } from './location';

const re = /(\/[\.\w-]+\.(html|js))/;

export function getPathToRoot(includeHTML = false): string {
    const locationString = getLocation('pathname');
    const match = re.exec(locationString);

    if (match?.index !== undefined) {
        const sliceIndex = includeHTML ? match.index + match[1].length : match.index;
        return locationString.slice(0, sliceIndex);
    }
    return locationString;
}
