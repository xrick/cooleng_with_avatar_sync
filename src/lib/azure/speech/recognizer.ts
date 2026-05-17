import { getAzureCredential } from '$lib/azure/credential';
import debug from 'debug';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const log = debug('speech:recognizer');

export interface RecognizerConfig {
	onVolumeChange?: (volume: number) => void;
	onSpeechStart?: () => void;
	onSpeechUpdate?: (text: string) => void;
	onSpeechEnd?: (text: string) => void;
	onPronunciationAssessed?: (result: SpeechSDK.PronunciationAssessmentResult) => void;
	topic?: string;
	phraseList?: string[];
	silenceTimeoutMs?: number; // VAD silence timeout in ms (500-5000)
}

export class Recognizer {
	private recognizer: SpeechSDK.SpeechRecognizer | undefined;
	private tokenRefreshInterval: ReturnType<typeof setInterval> | undefined;
	private audioContext: AudioContext | undefined;
	private microphone: MediaStreamAudioSourceNode | undefined;
	private speaking = false;

	async start(config: RecognizerConfig) {
		log('Starting speech recognition and audio analysis ...');
		const { token, region } = await getAzureCredential();
		log('Azure credentials obtained.');
		const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
		log('Microphone access granted.');

		// setup analyzer
		this.audioContext = new AudioContext();
		log('Audio context created.');
		this.microphone = this.audioContext.createMediaStreamSource(stream);
		const analyser = this.audioContext.createAnalyser();
		analyser.fftSize = 256;
		const bufferLength = analyser.frequencyBinCount;
		const dataArray = new Uint8Array(bufferLength);
		this.microphone.connect(analyser);
		log('Audio analyzer setup completed.');

		// setup recognizer
		const audioConfig = SpeechSDK.AudioConfig.fromStreamInput(stream);
		const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
		speechConfig.speechRecognitionLanguage = 'en-US';
		speechConfig.outputFormat = SpeechSDK.OutputFormat.Detailed;

		// Configure VAD timeout based on provided silenceTimeoutMs
		if (config.silenceTimeoutMs) {
			log(`Using custom silence timeout (${config.silenceTimeoutMs}ms).`);
			speechConfig.setProperty(
				SpeechSDK.PropertyId.Speech_SegmentationSilenceTimeoutMs,
				config.silenceTimeoutMs.toString()
			);
		} else {
			log('Using default silence timeout.');
		}

		this.recognizer = new SpeechSDK.SpeechRecognizer(speechConfig, audioConfig);

		if (config.onPronunciationAssessed) {
			log('Pronunciation assessment enabled.');
			const assessmentConfig = new SpeechSDK.PronunciationAssessmentConfig(
				'',
				SpeechSDK.PronunciationAssessmentGradingSystem.HundredMark,
				SpeechSDK.PronunciationAssessmentGranularity.Phoneme,
				true
			);
			assessmentConfig.enableProsodyAssessment = true;
			assessmentConfig.enableMiscue = true;
			if (config.topic) {
				log(`Pronunciation assessment topic: ${config.topic}`);
				assessmentConfig.enableContentAssessmentWithTopic(config.topic);
			}

			assessmentConfig.applyTo(this.recognizer);
		}

		if (config.phraseList && config.phraseList.length > 0) {
			log('Phrase list enabled.');
			const phraseListGrammar = SpeechSDK.PhraseListGrammar.fromRecognizer(this.recognizer);
			phraseListGrammar.addPhrases(config.phraseList);
		}

		log('Speech recognizer setup completed.');

		this.recognizer.recognizing = (s, e) => {
			if (e.result.reason === SpeechSDK.ResultReason.RecognizingSpeech) {
				if (!this.speaking) {
					this.speaking = true;
					log('Speech started.');
					config.onSpeechStart?.();
				}
				//log(`Recognizing speech: ${e.result.text}`, JSON.parse(e.result.json));
				config.onSpeechUpdate?.(e.result.text);
			}
		};

		this.recognizer.recognized = (s, e) => {
			if (e.result.reason === SpeechSDK.ResultReason.RecognizedSpeech) {
				log(`Speech recognized: ${e.result.text}`, JSON.parse(e.result.json));

				// Check if the recognized text is not empty and contains valid alphabetic characters (a-z)
				const containsValidWords = /[a-zA-Z]+/.test(e.result.text);

				if (e.result.text && e.result.text.trim() !== '' && containsValidWords) {
					config.onSpeechEnd?.(e.result.text);

					const assessment = SpeechSDK.PronunciationAssessmentResult.fromResult(e.result);
					if (assessment) {
						log('Got pronunciation assessment.', assessment);
						config.onPronunciationAssessed?.(assessment);
					}
				} else {
					if (!e.result.text || e.result.text.trim() === '') {
						log('Empty speech recognition result, skipping processing.');
					} else {
						log('Speech recognition result contains no valid words, skipping processing.');
					}
				}

				this.speaking = false;
			} else if (e.result.reason === SpeechSDK.ResultReason.NoMatch) {
				log('No speech could be recognized.');
			}
		};

		this.recognizer.canceled = (_, e) => {
			log(`Speech recognition canceled: ${e.errorDetails}`);
			this.recognizer?.stopContinuousRecognitionAsync();
		};

		this.recognizer.sessionStopped = () => {
			log('Session stopped.');
			this.recognizer?.stopContinuousRecognitionAsync();
		};

		this.tokenRefreshInterval = setInterval(async () => {
			if (!this.recognizer) {
				return;
			}
			const { token } = await getAzureCredential();
			this.recognizer.authorizationToken = token;
			log('Token refreshed.');
		}, 180_000);

		this.recognizer.startContinuousRecognitionAsync();
		log('Continuous recognition started.');

		const updateVolume = () => {
			analyser.getByteFrequencyData(dataArray);
			let sum = 0;
			for (let i = 0; i < bufferLength; i++) {
				sum += dataArray[i];
			}
			const average = sum / bufferLength;
			config.onVolumeChange?.(average / 255);
			if (this.recognizer) {
				requestAnimationFrame(updateVolume);
			}
		};

		updateVolume();
	}

	async stop() {
		log('Stopping speech recognition and audio analysis ...');
		clearInterval(this.tokenRefreshInterval);
		const p = new Promise<void>((resolve, reject) =>
			this.recognizer?.stopContinuousRecognitionAsync(resolve, reject)
		);
		this.recognizer?.close();
		this.recognizer = undefined;
		this.audioContext?.close();
		this.audioContext = undefined;
		await p;
		log('Speech recognition and audio analysis stopped.');
	}
}

export const recognizer = new Recognizer();
