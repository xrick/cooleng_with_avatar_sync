import { openai } from '$lib/server/azure/openai';
import { removeUnsupportedProps } from '$lib/server/utils/zod';
import { json } from '@sveltejs/kit';
import dedent from 'dedent';
import { zodResponseFormat } from 'openai/helpers/zod';
import { z } from 'zod';
import type { RequestHandler } from './$types';

const requestSchema = z.object({
	questions: z.array(z.string()),
	responses: z.array(z.string()),
	individualFeedbacks: z.array(z.string()),
	scores: z.object({
		speech: z.object({
			accuracy: z.number(),
			fluency: z.number(),
			prosody: z.number()
		}),
		content: z.object({
			vocabulary: z.number(),
			grammar: z.number(),
			relevance: z.number()
		})
	})
});

const responseSchema = z.object({
	feedback: z.string()
});

export const POST: RequestHandler = async ({ request }) => {
	const requestData = await request.json();

	const parsedRequest = requestSchema.safeParse(requestData);
	if (!parsedRequest.success) {
		return json({ error: 'Invalid request data' }, { status: 400 });
	}

	const { questions, responses, individualFeedbacks, scores } = parsedRequest.data;

	const response = await openai.chat.completions.create({
		model: '',
		messages: [
			{
				role: 'system',
				content: dedent`You are an English speaking coach for a language learning application called Cool English (酷英). You're reviewing a student's performance on an image description exercise with ${questions.length} questions.
					
					Create a comprehensive feedback summary for the student based on their responses to all questions and the individual feedback they've already received.
					
					Focus on:
					1. Overall speech patterns (pronunciation, fluency, intonation)
					2. Content quality (vocabulary, grammar, relevance)
					3. Specific areas of improvement
					4. Encouragement and strengths
					
					Keep your feedback concise (max 200 words), constructive, and actionable.
					Use zh-TW(臺灣繁體中文) for the feedback. 確保使用臺灣當地用語。`
			},
			{
				role: 'user',
				content: `Here are the student's responses to ${questions.length} image description questions:
					
					QUESTIONS:
					${questions.join('\n')}
					
					RESPONSES:
					${responses.join('\n\n')}
					
					INDIVIDUAL FEEDBACKS:
					${individualFeedbacks.join('\n\n')}
					
					AVERAGE SCORES:
					Speech - Accuracy: ${scores.speech.accuracy.toFixed(1)}, Fluency: ${scores.speech.fluency.toFixed(1)}, Prosody: ${scores.speech.prosody.toFixed(1)}
					Content - Vocabulary: ${scores.content.vocabulary.toFixed(1)}, Grammar: ${scores.content.grammar.toFixed(1)}, Relevance: ${scores.content.relevance.toFixed(1)}
					
					Please provide comprehensive overall feedback.
					Use zh-TW(臺灣繁體中文) for the feedback. 確保使用臺灣當地用語。`
			}
		],
		temperature: 0.5,
		max_tokens: 1000,
		response_format: zodResponseFormat(removeUnsupportedProps(responseSchema), 'feedback')
	});

	const reply = response.choices[0].message.content;
	if (!reply) {
		return json({ error: 'Empty feedback returned' }, { status: 500 });
	}
	const parsedResponse = JSON.parse(reply);

	const validatedResponse = responseSchema.safeParse(parsedResponse);
	if (!validatedResponse.success) {
		console.error('Invalid response format', validatedResponse.error);
		return json({ error: 'Invalid response format' }, { status: 500 });
	}

	return json(validatedResponse.data);
};
