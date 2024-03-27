import { Before } from '@badeball/cypress-cucumber-preprocessor';

function deleteDatabase(dbName) {
    return new Promise((resolve, reject) => {
        const request = indexedDB.deleteDatabase(dbName);
        request.onsuccess = resolve;
        request.onerror = reject;
        request.onblocked = reject;
    });
}

Before({ tags: '@clearIndexedDb' }, () => {
    cy.log('clearIndexedDb');
    sessionStorage.clear();
    localStorage.clear();
    indexedDB.databases().then((databases) => {
        console.log(databases);
        const deletionPromises = databases.map((db) => {
            if (db.name) {
                // eslint-disable-next-line @typescript-eslint/no-empty-function
                return deleteDatabase(db.name).catch(() => {});
            }
        });
        return Promise.all(deletionPromises);
    });
});
