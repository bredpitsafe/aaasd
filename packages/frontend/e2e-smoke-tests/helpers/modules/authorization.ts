import dotenv from 'dotenv';
import { Page } from 'playwright';

const selectors = {
    usernameInput: '#username',
    passwordInput: '#password',
    buttons: '#kc-form-buttons',
};

export async function authorization(page: Page) {
    dotenv.config();
    const username = process.env.KEYCLOAK_USER!;
    const password = process.env.KEYCLOAK_USER_PASSWORD!;
    const newUrl = 'https://ms.advsys.work/stable/dist/dashboard.html/';

    await page.goto(newUrl, { waitUntil: 'load' });
    await page.fill(selectors.usernameInput, username);
    await page.fill(selectors.passwordInput, password);
    await page.click(selectors.buttons);

    await new Promise((resolve) => setTimeout(resolve, 5000));
}
