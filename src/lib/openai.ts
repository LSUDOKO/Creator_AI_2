import OpenAI from 'openai';

// Use environment variable for API key - never hardcode API keys in source code
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.warn('OpenAI API key not found. Please set VITE_OPENAI_API_KEY in your .env file.');
}

export const openai = OPENAI_API_KEY ? new OpenAI({
  apiKey: OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, this should be handled server-side
}) : null;

export interface TranscriptionResult {
  text: string;
  speaker: 'user' | 'ai';
  timestamp: Date;
  confidence?: number;
}

export class VoiceTranscriber {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onTranscription: (result: TranscriptionResult) => void;
  private onError: (error: string) => void;
  private recordingInterval: NodeJS.Timeout | null = null;

  constructor(
    onTranscription: (result: TranscriptionResult) => void,
    onError: (error: string) => void
  ) {
    this.onTranscription = onTranscription;
    this.onError = onError;
  }

  async startTranscription(stream: MediaStream, speaker: 'user' | 'ai' = 'user') {
    try {
      // Check if OpenAI client is available
      if (!openai) {
        this.onError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
        return;
      }

      if (this.isRecording) {
        this.stopTranscription();
      }

      this.mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length > 0) {
          await this.transcribeAudio(speaker);
          this.audioChunks = [];
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      // Record in 3-second chunks for real-time transcription
      this.recordingInterval = setInterval(() => {
        if (this.mediaRecorder && this.isRecording) {
          this.mediaRecorder.stop();
          this.mediaRecorder.start();
        }
      }, 3000);

    } catch (error) {
      console.error('Error starting transcription:', error);
      this.onError('Failed to start voice transcription. Please check your microphone permissions.');
    }
  }

  stopTranscription() {
    if (this.mediaRecorder && this.isRecording) {
      this.mediaRecorder.stop();
      this.isRecording = false;
    }

    if (this.recordingInterval) {
      clearInterval(this.recordingInterval);
      this.recordingInterval = null;
    }
  }

  private async transcribeAudio(speaker: 'user' | 'ai') {
    try {
      if (!openai) {
        this.onError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
        return;
      }

      if (this.audioChunks.length === 0) return;

      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      
      // Convert to File object for OpenAI API
      const audioFile = new File([audioBlob], 'audio.webm', { type: 'audio/webm' });

      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'json',
        temperature: 0.2,
      });

      if (transcription.text && transcription.text.trim().length > 0) {
        this.onTranscription({
          text: transcription.text,
          speaker,
          timestamp: new Date(),
        });
      }

    } catch (error) {
      console.error('Error transcribing audio:', error);
      
      // Handle specific OpenAI API errors
      if (error instanceof OpenAI.APIError) {
        if (error.status === 429) {
          this.onError('OpenAI API quota exceeded. Please check your plan and billing details at https://platform.openai.com/account/billing. You may need to add credits to your OpenAI account or upgrade your plan.');
        } else if (error.status === 401) {
          this.onError('OpenAI API authentication failed. Please check that your VITE_OPENAI_API_KEY environment variable is set correctly.');
        } else if (error.status === 400) {
          this.onError('Invalid request to OpenAI API. The audio format may not be supported.');
        } else {
          this.onError(`OpenAI API error (${error.status}): ${error.message}`);
        }
      } else {
        this.onError('Failed to transcribe audio. Please try again.');
      }
    }
  }

  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }
}