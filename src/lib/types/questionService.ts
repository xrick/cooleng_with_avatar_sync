import type { ImageQuestion, Question } from './questions';

// Sample questions for the Question Answering test
export const questionBank: Question[] = [
	{
		id: 'q1',
		text: 'What do you like to do in your free time?',
		exampleAnswer:
			'In my free time, I enjoy reading books, watching movies, and going for walks in the park. I find these activities relaxing and enjoyable.',
		difficulty: 'beginner',
		category: 'daily life'
	},
	{
		id: 'q2',
		text: 'Could you describe your hometown?',
		exampleAnswer:
			'My hometown is a small city with beautiful parks and historic buildings. It has a river running through the center and friendly people. The weather is usually mild throughout the year.',
		difficulty: 'beginner',
		category: 'places'
	},
	{
		id: 'q3',
		text: 'What are your plans for the future?',
		exampleAnswer:
			"In the future, I plan to complete my education, find a good job in my field, and perhaps travel to different countries. I'm also interested in learning new languages and skills.",
		difficulty: 'intermediate',
		category: 'personal'
	},
	{
		id: 'q4',
		text: 'How do you think technology has changed education?',
		exampleAnswer:
			'Technology has revolutionized education by making information more accessible. Students can now learn online, access digital resources, and collaborate remotely. However, it also presents challenges like digital distractions and the digital divide.',
		difficulty: 'advanced',
		category: 'education'
	},
	{
		id: 'q5',
		text: 'What are the advantages and disadvantages of living in a big city?',
		exampleAnswer:
			'Living in a big city offers advantages like job opportunities, diverse culture, and convenient transportation. However, disadvantages include high living costs, crowding, and pollution. It depends on personal preferences whether city life is suitable.',
		difficulty: 'intermediate',
		category: 'places'
	}
];

// Real image questions for the Image Description test
export const imageQuestionBank: ImageQuestion[] = [
	{
		id: 'img1',
		text: 'Describe what you see in this image.',
		imageUrl: 'https://i.imgur.com/d1zItdX.png',
		subquestions: [
			'What do you see in the picture? Describe it in as much detail as possible.',
			'How does the man probably feel?',
			'What might have happened to him before this moment?',
			' If you were in his situation, what would you do?'
		],
		difficulty: 'high-intermediate',
		category: 'work'
	}
];
// Sample questions for the Image Description test
export const sampleImageQuestionBank: ImageQuestion[] = [
	{
		id: 'img1',
		text: 'Describe what you see in this image.',
		imageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470',
		description: 'A landscape image showing mountains and a lake.',
		subquestions: [
			'Describe what you see in this image.',
			'What natural features can you identify in this landscape?',
			'What time of day do you think it is? Why?',
			'How would you describe the atmosphere or mood of this scene?'
		],
		difficulty: 'beginner',
		category: 'nature'
	},
	{
		id: 'img2',
		text: 'What do you see in this beach scene?',
		imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e',
		description: 'A beautiful beach with white sand and blue water.',
		subquestions: [
			'What do you see in this beach scene?',
			'What activities could people enjoy at this location?',
			'What is the weather like in this scene?',
			'Would you like to visit this place? Why or why not?'
		],
		difficulty: 'beginner',
		category: 'nature'
	},
	{
		id: 'img3',
		text: 'Describe this city scene and what might be happening.',
		imageUrl: 'https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b',
		description: 'A busy city street with buildings.',
		subquestions: [
			'Describe this city scene and what might be happening.',
			'What kinds of buildings or structures can you see?',
			'What time of day might it be and how can you tell?',
			'How would you describe the atmosphere of this urban environment?'
		],
		difficulty: 'intermediate',
		category: 'urban'
	},
	{
		id: 'img4',
		text: 'Describe what you see in this cafe scene.',
		imageUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24',
		description: 'People sitting in a cafe enjoying coffee and conversation.',
		subquestions: [
			'Describe what you see in this cafe scene.',
			'What are the people in the image doing?',
			'What details about the cafe environment can you observe?',
			'What kind of atmosphere does this place have?'
		],
		difficulty: 'intermediate',
		category: 'lifestyle'
	},
	{
		id: 'img5',
		text: 'Describe what is happening in this market scene.',
		imageUrl: 'https://images.unsplash.com/photo-1513125370-3460ebe3401b',
		description:
			'An open-air produce market with vendors selling fresh fruits and vegetables. There are colorful displays of produce and people shopping.',
		subquestions: [
			'Describe what is happening in this market scene.',
			'What types of products are being sold here?',
			'Describe the people you can see and what they might be doing.',
			'Why do you think people choose to shop at markets like this one?'
		],
		difficulty: 'advanced',
		category: 'commerce'
	},
	{
		id: 'img6',
		text: 'Describe this classroom scene.',
		imageUrl: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b',
		description: 'A classroom with students and a teacher engaged in learning activities.',
		subquestions: [
			'Describe this classroom scene.',
			'What can you tell about the teaching and learning happening here?',
			'How would you describe the classroom environment?',
			'How does this classroom compare to your own educational experiences?'
		],
		difficulty: 'advanced',
		category: 'education'
	}
];

// Keep track of which images have been used (persisted in session storage)
let usedImages: Record<string, boolean> = {};

// Initialize used images tracking from session storage
try {
	if (typeof sessionStorage !== 'undefined') {
		const storedUsedImages = sessionStorage.getItem('usedImages');
		if (storedUsedImages) {
			usedImages = JSON.parse(storedUsedImages);
		}
	}
} catch (e) {
	console.error('[Image-Question] Error loading used images from session storage:', e);
	usedImages = {};
}

// Save used images to session storage
function saveUsedImages() {
	try {
		if (typeof sessionStorage !== 'undefined') {
			sessionStorage.setItem('usedImages', JSON.stringify(usedImages));
		}
	} catch (e) {
		console.error('[Image-Question] Error saving used images to session storage:', e);
	}
}

// Reset used images
export function resetUsedImages() {
	usedImages = {};
	saveUsedImages();
	console.log('[Image-Question] Used images reset');
}

export const lvls = ['beginner', 'intermediate', 'high-intermediate', 'advanced'] as const;
export type Level = (typeof lvls)[number];

// Function to get a random question from the bank
export function getRandomQuestion(difficulty?: Level): Question {
	const filteredQuestions = difficulty
		? questionBank.filter((q) => q.difficulty === difficulty)
		: questionBank;

	return filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
}

// Function to get a random image question from the bank
export function getRandomImageQuestion(difficulty?: Level): ImageQuestion {
	try {
		// Ensure URLs have proper parameters for Unsplash
		imageQuestionBank.forEach((q) => {
			// Add quality and size parameters if the URL is from Unsplash and doesn't have parameters
			if (q.imageUrl.includes('unsplash.com') && !q.imageUrl.includes('?')) {
				q.imageUrl += '?q=80&w=1200&auto=format&fit=crop';
			}
		});

		// Filter questions by difficulty
		const filteredQuestions = difficulty
			? imageQuestionBank.filter((q) => q.difficulty === difficulty)
			: imageQuestionBank;

		// Check if we have any questions in this difficulty level
		if (filteredQuestions.length === 0) {
			console.warn(`[Image-Question] No questions found for difficulty: "${difficulty}"`);
			return {
				id: 'fallback',
				text: 'Describe what you see in this image.',
				imageUrl: 'https://placehold.co/1200x800/e6f7ff/0099cc?text=Cool+English+Image',
				description: 'A placeholder image for the speaking practice.',
				subquestions: [
					'Describe what you see in this image.',
					'What elements can you identify in this placeholder?',
					'How might you improve this simple image?',
					'What purpose do placeholder images serve in web design?'
				],
				difficulty: difficulty || 'beginner',
				category: 'general'
			};
		}

		// Filter out used questions for this difficulty
		const availableQuestions = filteredQuestions.filter((q) => !usedImages[q.id]);

		// Log availability information
		console.log(
			`[Image-Question] Available questions for difficulty "${difficulty}": ${availableQuestions.length} of ${filteredQuestions.length}`
		);

		// Check if we've used all questions of this difficulty
		if (availableQuestions.length === 0) {
			// If all questions in this difficulty have been used, reset tracking for THIS DIFFICULTY ONLY
			console.warn(
				`[Image-Question] All questions for difficulty "${difficulty}" have been used. Resetting tracking for this difficulty.`
			);

			// Reset ONLY this difficulty level questions
			filteredQuestions.forEach((q) => {
				delete usedImages[q.id];
			});
			saveUsedImages();

			// Return a random question from the now-reset difficulty level
			const newQuestion = filteredQuestions[Math.floor(Math.random() * filteredQuestions.length)];
			usedImages[newQuestion.id] = true;
			saveUsedImages();

			console.log(`[Image-Question] Selected question after reset: ${newQuestion.id}`);
			return newQuestion;
		}

		// Return an available question and mark it as used
		const selectedQuestion =
			availableQuestions[Math.floor(Math.random() * availableQuestions.length)];
		usedImages[selectedQuestion.id] = true;
		saveUsedImages();

		console.log(`[Image-Question] Selected question: ${selectedQuestion.id}`);
		return selectedQuestion;
	} catch (error) {
		// Force direct console log to ensure it's visible
		console.error('[Image-Question] Error in getRandomImageQuestion:', error);

		// Provide a fallback image question in case of error
		return {
			id: 'fallback',
			text: 'Describe what you see in this image.',
			imageUrl: 'https://placehold.co/1200x800/e6f7ff/0099cc?text=Cool+English+Image',
			description: 'A placeholder image for the speaking practice.',
			subquestions: [
				'Describe what you see in this image.',
				'What elements can you identify in this placeholder?',
				'How might you improve this simple image?',
				'What purpose do placeholder images serve in web design?'
			],
			difficulty: difficulty || 'beginner',
			category: 'general'
		};
	}
}

// Function to get a list of difficulties that have at least one question
export function getAvailableDifficulties(): Level[] {
	// Create a set to track unique difficulties present in the question bank
	const availableDifficulties = new Set<Level>();

	// Check each question in the bank and add its difficulty to the set
	imageQuestionBank.forEach((question) => {
		availableDifficulties.add(question.difficulty as Level);
	});

	// Convert the set to an array and return it
	return Array.from(availableDifficulties);
}
