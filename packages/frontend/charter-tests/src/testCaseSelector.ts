import { ECaseName } from './testChartsData';

export function TestCaseSelector() {
    const selector = document.createElement('select');
    const options = Object.values(ECaseName).map((value) => {
        const option = document.createElement('option');
        option.value = value;
        option.text = value;
        return option;
    });

    selector.append(...options);

    selector.addEventListener('change', (event) => {
        const url = new URL(location.href);
        url.searchParams.set(
            'case',
            // @ts-ignore
            event.target.value,
        );
        window.location.href = url.toString();
    });

    return selector;
}
