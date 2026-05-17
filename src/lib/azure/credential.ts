import debug from 'debug';

const log = debug('azure');

export type AzureCredential = { token: string; region: string };

let cred: Promise<AzureCredential> | null = null;

export async function getAzureCredential(): Promise<AzureCredential> {
	if (cred && credentialIsValid(await cred)) {
		log('Returning cached Azure token');
		return cred;
	}

	cred = fetchAzureCredential();

	return cred;
}

async function fetchAzureCredential(): Promise<AzureCredential> {
	const res = await fetch('/api/speech/credentials');
	if (!res.ok) {
		log('Failed to fetch Azure token', res);
		throw new Error('Failed to fetch Azure token');
	}

	return res.json();
}

function credentialIsValid(cred: AzureCredential): cred is AzureCredential {
	const { token } = cred;
	if (typeof token !== 'string') {
		return false;
	}

	const jwt = token.split('.');
	if (jwt.length !== 3) {
		log('Invalid JWT token');
		return false;
	}

	const payload = JSON.parse(atob(jwt[1]));
	if (payload.exp * 1000 < Date.now()) {
		log('Token expired');
		return false;
	}

	log('Token is valid, expires at', new Date(payload.exp * 1000).toISOString());
	return true;
}
