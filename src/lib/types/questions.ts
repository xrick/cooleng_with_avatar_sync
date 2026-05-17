export interface Question {
	id: string;
	text: string;
	exampleAnswer?: string;
	difficulty: 'beginner' | 'intermediate' | 'high-intermediate' | 'advanced';
	category: string;
}

export interface ImageQuestion extends Question {
	imageUrl: string;
	description?: string;
	subquestions?: string[]; // Array of specific questions for this image
}
