import { env } from '$env/dynamic/private';
import debug from 'debug';

const log = debug('azure:speech:credentials');

if (!env.AZURE_SPEECH_KEY || !env.AZURE_SPEECH_REGION) {
	throw new Error('You forgot to add your speech key or region to the .env file.');
}

const speechKey = env.AZURE_SPEECH_KEY;
const speechRegion = env.AZURE_SPEECH_REGION;

const headers = {
	'Ocp-Apim-Subscription-Key': speechKey,
	'Content-Type': 'application/x-www-form-urlencoded'
};

export async function getCredential() {
	try {
		const res = await fetch(
			`https://${speechRegion}.api.cognitive.microsoft.com/sts/v1.0/issueToken`,
			{
				method: 'POST',
				headers
			}
		);

		if (!res.ok) {
			log('Failed to fetch Azure token', res);
			throw new Error('Network response was not ok');
		}

		const token = await res.text();
		log('Successfully obtained token for region %s', speechRegion);
		return { token, region: speechRegion };
	} catch (err) {
		log('Error authorizing speech key: %O', err);
		throw new Error('There was an error authorizing your speech key.');
	}
}
