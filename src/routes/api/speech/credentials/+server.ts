import { getCredential } from '$lib/server/azure/speech';
import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	try {
		const cred = await getCredential();
		return json(cred);
	} catch (error) {
		console.error('Error fetching Azure speech credentials:', error);
		return json({ error: 'Failed to fetch credentials' }, { status: 500 });
	}
};
