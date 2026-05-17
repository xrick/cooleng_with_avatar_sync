import { getAzureCredential } from '$lib/azure/credential';
import debug from 'debug';
import * as SpeechSDK from 'microsoft-cognitiveservices-speech-sdk';

const log = debug('speech:synthesizer');

export interface SynthetizerConfig {
	text: string;
	onSynthesizing?: (audioChunk: ArrayBuffer) => void;
	onSynthesisCompleted?: () => void;
	onError?: (error: string) => void;
}

export class Synthesizer {
	private partialSentenceBuffer = '';
	private partialSentenceTimeout = 1000;
	constructor(
		private synthesizer: SpeechSDK.SpeechSynthesizer,
		private player: SpeechSDK.SpeakerAudioDestination,
		public readonly name: string,
		private readonly speechConfig: SpeechSDK.SpeechConfig
	) {}

	public static async create(voiceName: string) {
		const { token, region } = await getAzureCredential();
		const player = new SpeechSDK.SpeakerAudioDestination();
		const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(player);
		const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
		speechConfig.speechSynthesisLanguage = 'en-US';
		speechConfig.speechSynthesisVoiceName = voiceName;

		const synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);
		return new Synthesizer(synthesizer, player, voiceName, speechConfig);
	}

	async interrupt() {
		this.player.pause();
		this.player.close();
		this.synthesizer.close(() => log('Interrupted speech synthesis.'));

		const { token, region } = await getAzureCredential();
		this.player = new SpeechSDK.SpeakerAudioDestination();
		const audioConfig = SpeechSDK.AudioConfig.fromSpeakerOutput(this.player);
		const speechConfig = SpeechSDK.SpeechConfig.fromAuthorizationToken(token, region);
		speechConfig.speechSynthesisLanguage = 'en-US';
		speechConfig.speechSynthesisVoiceName = this.speechConfig.speechSynthesisVoiceName;
		this.synthesizer = new SpeechSDK.SpeechSynthesizer(speechConfig, audioConfig);

		this.partialSentenceBuffer = '';
	}

	async synthesize(text: string, flush = false) {
		this.partialSentenceBuffer += text;
		const hasCompletedSentence = /[.?!]/.test(this.partialSentenceBuffer);
		if (!hasCompletedSentence && !flush) {
			setTimeout(() => this.synthesize('', true), this.partialSentenceTimeout);
			return;
		}

		const lastSentenceEnd = Math.max(
			this.partialSentenceBuffer.lastIndexOf('.'),
			this.partialSentenceBuffer.lastIndexOf('!'),
			this.partialSentenceBuffer.lastIndexOf('?')
		);
		const target = this.partialSentenceBuffer.slice(0, lastSentenceEnd + 1).trim();
		this.partialSentenceBuffer = this.partialSentenceBuffer.slice(lastSentenceEnd + 1);

		if (target === '') {
			return;
		}

		const promise = new Promise<void>((resolve) => {
			this.start({
				text: target,
				onSynthesisCompleted() {
					resolve();
				}
			});
		});

		return promise;
	}

	public start(config: SynthetizerConfig) {
		log('Starting speech synthesis ...');

		this.player.resume();

		this.synthesizer.synthesizing = (s, e) => {
			if (e.result.reason === SpeechSDK.ResultReason.SynthesizingAudio) {
				//log('Synthesizing audio chunk.');
				config.onSynthesizing?.(e.result.audioData);
			}
		};

		this.synthesizer.synthesisCompleted = (s, e) => {
			if (e.result.reason === SpeechSDK.ResultReason.SynthesizingAudioCompleted) {
				log('Synthesis completed.');
				config.onSynthesisCompleted?.();
			} else if (e.result.reason === SpeechSDK.ResultReason.Canceled) {
				const cancellationDetails = SpeechSDK.CancellationDetails.fromResult(e.result);
				log(`Synthesis canceled: ${cancellationDetails.errorDetails}`);
				config.onError?.(cancellationDetails.errorDetails);
			}
		};

		this.synthesizer.speakTextAsync(
			config.text,
			() => log('Speak text async call succeeded.'),
			(error) => {
				log(`Speak text async call failed: ${error}`);
				config.onError?.(error);
			}
		);
	}

	public async stop() {
		log('Stopping speech synthesis ...');
		this.player.pause();
		this.player.close();
		this.synthesizer.close(() => log('Speech synthesis stopped.'));
	}
}
