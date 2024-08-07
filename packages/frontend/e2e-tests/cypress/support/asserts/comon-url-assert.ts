export function checkUrlInclude(url: string) {
    cy.url().should('include', url);
}

export function checkNotUrlInclude(url: string) {
    cy.url().should('not.include', url);
}

export function getBackendServerUrl(PAGE_URL, backendServerName) {
    return `${PAGE_URL}/${backendServerName}`;
}

export function getBackendServerUrlByIndex(PAGE_URL, backendServerName, index) {
    return `${PAGE_URL}/${backendServerName}/${index}`;
}

export function getServerComponentUrl(PAGE_URL, backendServerName, idTask, nameTab) {
    return `${PAGE_URL}/${backendServerName}/${idTask}?tab=${nameTab}`;
}

export function getServerTabUrl(PAGE_URL, backendServerName, nameTab) {
    return `${PAGE_URL}/${backendServerName}${nameTab}`;
}

export function getServerComponentTabUrl(PAGE_URL, backendServerName, backendServerId, nameTab) {
    return `${PAGE_URL}/${backendServerName}/${backendServerId}/${nameTab}`;
}

export function getBackendServerUrlAndTabUrl(PAGE_URL, backendServerName, namePage, nameTab) {
    return `${PAGE_URL}/${backendServerName}/${namePage}?tab=${nameTab}&singleTab=true`;
}
