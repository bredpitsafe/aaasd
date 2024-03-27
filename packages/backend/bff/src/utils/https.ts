import { createCA, createCert } from 'mkcert';

const CERT_VALIDITY = 365;

const ca = await createCA({
    organization: 'localhost',
    countryCode: 'NP',
    state: 'Bagmati',
    locality: 'Kathmandu',
    validity: CERT_VALIDITY,
});

export const cert = await createCert({
    ca: { key: ca.key, cert: ca.cert },
    domains: ['127.0.0.1', 'localhost'],
    validity: CERT_VALIDITY,
});
