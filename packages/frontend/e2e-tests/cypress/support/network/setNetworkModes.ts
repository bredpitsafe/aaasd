export function setNetworkModeOn() {
    cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(true);
        cy.wrap(win).trigger('online');
    });
}
export const setNetworkModeOff = () => {
    cy.window().then((win) => {
        cy.stub(win.navigator, 'onLine').value(false);
        cy.wrap(win).trigger('offline');
    });
};
