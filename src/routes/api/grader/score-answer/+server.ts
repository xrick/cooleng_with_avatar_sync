import { openai } from '$lib/server/azure/openai';
import { detectJailbreak } from '$lib/server/utils/jailbreak';
import { removeUnsupportedProps } from '$lib/server/utils/zod';
import { json } from '@sveltejs/kit';
import dedent from 'dedent';
import type OpenAI from 'openai';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const requestSchema = z.object({
	question: z
		.object({
			text: z.string().max(1000),
			image: z.string().url().max(1000).optional()
		})
		.optional(),
	answer: z.string().max(1000)
});

const responseSchema = z.object({
	vocabulary: z.number().min(0).max(100),
	grammar: z.number().min(0).max(100),
	relevance: z.number().min(0).max(100),
	grade: z.number().min(0).max(5),
	feedback: z.string().max(4000)
});

export const POST: RequestHandler = async ({ request }) => {
	const requestData = await request.json();

	const parsedRequest = requestSchema.safeParse(requestData);
	if (!parsedRequest.success) {
		return json({ error: 'Invalid request data' }, { status: 400 });
	}
	const { question, answer } = parsedRequest.data;

	const jailbreakCheck = detectJailbreak(answer);

	const content: OpenAI.ChatCompletionContentPart[] = [];
	if (question) {
		if (question.image) {
			content.push({
				type: 'image_url',
				image_url: {
					url: question.image,
					detail: 'high'
				}
			});
		}
		content.push({
			type: 'text',
			text: `<QUESTION>${question.text}</QUESTION>`
		});
	}
	content.push({
		type: 'text',
		text: `<USER_ANSWER>${answer}</USER_ANSWER>`
	});

	const response = await openai.chat.completions.create({
		model: '',
		messages: [
			{
				role: 'system',
				content: dedent`You are a professional English language teacher evaluating a student's response for a language learning application.
				
				評分標準:
				1. Vocabulary (richness, appropriateness, variety) - Score 0-100
				2. Grammar (correctness, complexity) - Score 0-100
				3. Relevance (how well it addresses the topic/question) - Score 0-100
				4. Overall grade (0-5) based on the above scores.
				5. Provide feedback to the student, including strengths and areas for improvement.
				6. Use a clear, concise, friendly tone in your feedback, starting with "你", and avoid using "我" or "你應該".
				7. Use zh-TW(臺灣繁體中文) for the feedback. 確保使用臺灣當地用語。
				`
			},
			{
				role: 'user',
				content
			}
		],
		temperature: 0.2,
		max_tokens: 1000,
		response_format: zodResponseFormat(removeUnsupportedProps(responseSchema), 'analysis')
	});

	const { jailbreak } = await jailbreakCheck;
	if (jailbreak) {
		return json({ error: 'Potential jailbreak detected' }, { status: 400 });
	}

	const reply = response.choices[0].message.content;
	if (!reply) {
		return json({ error: 'Empty analysis returned' }, { status: 500 });
	}
	const parsedResponse = JSON.parse(reply);

	const validatedResponse = responseSchema.safeParse(parsedResponse);
	if (!validatedResponse.success) {
		console.error('Invalid response format', validatedResponse.error);
		return json({ error: 'Invalid analysis response' }, { status: 500 });
	}

	return json(validatedResponse.data);
};
