import fetch from 'node-fetch';

export async function getToken(user: string): Promise<string> {
    const password = 'password';
    const clientId = 'test_client_id';
    const clientSecret = 'secret';

    const res = await fetch('http://localhost:8101/token', {
        method: 'POST',
        body: `grant_type=password&scope=openid&username=${user}&password=${password}&client_id=${clientId}&client_secret=${clientSecret}`,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
    });
    // @ts-ignore
    return (await res.json()).access_token as string;
}
