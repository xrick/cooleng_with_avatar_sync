// Client-side grader to use scoring API
import debug from 'debug';
import type { ContentAssessment } from './types';
import type { ImageQuestion, Question } from './types/questions';

const logGrader = debug('app:grader');
const logGraderError = debug('app:grader:error');

export interface GraderResponse {
	vocabulary: number; // 0-100
	grammar: number; // 0-100
	relevance: number; // 0-100
	grade: number; // 0-5
	feedback: string;
}

export interface GraderRequest {
	question?: {
		text: string;
		image?: string;
	};
	answer: string;
}

export interface OverallFeedbackRequest {
	questions: string[];
	responses: string[];
	individualFeedbacks: string[];
	scores: {
		speech: {
			accuracy: number;
			fluency: number;
			prosody: number;
		};
		content: {
			vocabulary: number;
			grammar: number;
			relevance: number;
		};
	};
}

export interface OverallFeedbackResponse {
	feedback: string;
}

export class Grader {
	/**
	 * Score a student's answer using the grader API
	 * @param answer The text of the student's answer
	 * @param question Optional question context
	 * @returns ContentAssessment and feedback
	 */
	static async scoreAnswer(
		answer: string,
		question?: Question | ImageQuestion
	): Promise<{
		content: ContentAssessment;
		feedback: string;
	}> {
		try {
			const request: GraderRequest = {
				answer
			};

			// Add question context if available
			if (question) {
				request.question = {
					text: question.text
				};

				// Add image URL for image questions
				if ('imageUrl' in question && question.imageUrl) {
					request.question.image = question.imageUrl;
				}
			}

			logGrader('Sending grader request: %O', request);

			// Call the scoring API
			const response = await fetch('/api/grader/score-answer', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(request)
			});

			if (!response.ok) {
				const error = await response.json();
				logGraderError('API error: %O', error);
				throw new Error(`API error: ${error.error || response.statusText}`);
			}

			const result: GraderResponse = await response.json();
			logGrader('Received grader response: %O', result);

			// Transform the API response to our application's ContentAssessment format
			return {
				content: {
					vocabulary: result.vocabulary,
					grammar: result.grammar,
					relevance: result.relevance,
					total: result.grade
				},
				feedback: result.feedback
			};
		} catch (error) {
			logGraderError('Error scoring answer: %O', error);
			throw error;
		}
	}

	/**
	 * Generate overall feedback based on multiple question responses
	 * @param questions Array of question texts
	 * @param responses Array of student responses (text)
	 * @param individualFeedbacks Array of individual feedbacks for each response
	 * @param scores Average scores for speech and content
	 * @returns Overall feedback text
	 */
	static async generateOverallFeedback(
		questions: string[],
		responses: string[],
		individualFeedbacks: string[],
		scores: {
			speech: { accuracy: number; fluency: number; prosody: number };
			content: { vocabulary: number; grammar: number; relevance: number };
		}
	): Promise<string> {
		try {
			const request: OverallFeedbackRequest = {
				questions,
				responses,
				individualFeedbacks,
				scores
			};

			logGrader('Sending overall feedback request: %O', request);

			// Call the overall feedback API
			const response = await fetch('/api/grader/overall-feedback', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(request)
			});

			if (!response.ok) {
				const error = await response.json();
				logGraderError('Overall feedback API error: %O', error);
				throw new Error(`API error: ${error.error || response.statusText}`);
			}

			const result: OverallFeedbackResponse = await response.json();
			logGrader('Received overall feedback response: %O', result);

			return result.feedback;
		} catch (error) {
			logGraderError('Error generating overall feedback: %O', error);
			throw error;
		}
	}
}
