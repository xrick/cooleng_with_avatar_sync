import type SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

export interface Message {
	name: string;
	content: string;
	result?: SpeechSDK.PronunciationAssessmentResult;
	self?: boolean;
	audio?: string;
	avatar?: string;
	score?: number;
	/** ignore in the chat context */
	ignore?: boolean;
	/** hidden from the user interface */
	hidden?: boolean;
}

// 語音評分（Azure）
export interface SpeechAssessment {
	accuracy: number; // 0-100 (Azure)
	fluency: number; // 0-100 (Azure)
	prosody: number; // 0-100 (Azure)
	total: number; // 0-5 (依據標準轉換)
	detailResult?: SpeechSDK.PronunciationAssessmentResult;
}

// 內容評分（LLM）
export interface ContentAssessment {
	vocabulary: number; // 0-100
	grammar: number; // 0-100
	relevance: number; // 0-100
	total: number; // 0-5
}

// 總體評分結構
export interface AssessmentResult {
	speech: SpeechAssessment;
	content: ContentAssessment;
	overallScore: number; // (speech.total + content.total) * 10
	feedback: string;
}
