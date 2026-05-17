import { env } from '$env/dynamic/private';
import { AzureOpenAI } from 'openai';

export const openai = new AzureOpenAI({
	endpoint: env.AZURE_OPENAI_ENDPOINT,
	apiKey: env.AZURE_OPENAI_API_KEY,
	apiVersion: env.AZURE_OPENAI_API_VERSION,
	deployment: env.DEPLOYMENT
});
