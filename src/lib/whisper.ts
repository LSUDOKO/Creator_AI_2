import OpenAI from 'openai';

// Configuration
const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB limit for OpenAI API
const CHUNK_DURATION = 3000; // 3 seconds for real-time transcription

export interface WhisperTranscriptionResult {
  text: string;
  speaker: 'user' | 'ai';
  timestamp: Date;
  confidence?: number;
  language?: string;
}

export interface WhisperConfig {
  language?: string;
  temperature?: number;
  response_format?: 'json' | 'text' | 'srt' | 'verbose_json' | 'vtt';
  prompt?: string;
}

export class WhisperTranscriber {
  private openai: OpenAI | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onTranscription: (result: WhisperTranscriptionResult) => void;
  private onError: (error: string) => void;
  private recordingInterval: NodeJS.Timeout | null = null;
  private config: WhisperConfig;

  constructor(
    onTranscription: (result: WhisperTranscriptionResult) => void,
    onError: (error: string) => void,
    config: WhisperConfig = {}
  ) {
    this.onTranscription = onTranscription;
    this.onError = onError;
    this.config = {
      language: 'en',
      temperature: 0.2,
      response_format: 'verbose_json',
      ...config
    };

    if (OPENAI_API_KEY) {
      this.openai = new OpenAI({
        apiKey: OPENAI_API_KEY,
        dangerouslyAllowBrowser: true // Note: In production, use server-side proxy
      });
    } else {
      console.warn('OpenAI API key not found. Set VITE_OPENAI_API_KEY in your .env file.');
    }
  }

  /**
   * Start real-time transcription from a media stream
   */
  async startRealtimeTranscription(stream: MediaStream, speaker: 'user' | 'ai' = 'user') {
    try {
      if (!this.openai) {
        this.onError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
        return;
      }

      if (this.isRecording) {
        this.stopTranscription();
      }

      // Configure MediaRecorder for optimal audio quality
      const options = this.getBestMediaRecorderOptions();
      this.mediaRecorder = new MediaRecorder(stream, options);

      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          this.audioChunks.push(event.data);
        }
      };

      this.mediaRecorder.onstop = async () => {
        if (this.audioChunks.length > 0) {
          await this.transcribeAudioChunks(speaker);
          this.audioChunks = [];
        }
      };

      this.mediaRecorder.start();
      this.isRecording = true;

      // Process audio in chunks for real-time transcription
      this.recordingInterval = setInterval(() => {
        if (this.mediaRecorder && this.isRecording) {
          this.mediaRecorder.stop();
          this.mediaRecorder.start();
        }
      }, CHUNK_DURATION);

    } catch (error) {
      console.error('Error starting Whisper transcription:', error);
      this.onError('Failed to start voice transcription. Please check your microphone permissions.');
    }
  }

  /**
   * Transcribe a single audio file
   */
  async transcribeFile(audioFile: File, speaker: 'user' | 'ai' = 'user'): Promise<WhisperTranscriptionResult | null> {
    try {
      if (!this.openai) {
        throw new Error('OpenAI API key not configured');
      }

      if (audioFile.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      }

      const transcription = await this.openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: this.config.language,
        response_format: this.config.response_format,
        temperature: this.config.temperature,
        prompt: this.config.prompt,
      });

      let text = '';
      let language = undefined;

      if (this.config.response_format === 'verbose_json' && typeof transcription === 'object') {
        text = transcription.text;
        language = transcription.language;
      } else if (typeof transcription === 'string') {
        text = transcription;
      } else if (typeof transcription === 'object' && 'text' in transcription) {
        text = transcription.text;
      }

      if (text && text.trim().length > 0) {
        const result: WhisperTranscriptionResult = {
          text: text.trim(),
          speaker,
          timestamp: new Date(),
          language,
        };
        
        this.onTranscription(result);
        return result;
      }

      return null;

    } catch (error) {
      console.error('Error transcribing audio file:', error);
      this.handleTranscriptionError(error);
      return null;
    }
  }

  /**
   * Stop transcription
   */
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

  /**
   * Check if currently recording
   */
  isCurrentlyRecording(): boolean {
    return this.isRecording;
  }

  /**
   * Update configuration
   */
  updateConfig(config: Partial<WhisperConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get supported languages for Whisper
   */
  static getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'ru', name: 'Russian' },
      { code: 'ja', name: 'Japanese' },
      { code: 'ko', name: 'Korean' },
      { code: 'zh', name: 'Chinese' },
      { code: 'ar', name: 'Arabic' },
      { code: 'hi', name: 'Hindi' },
      { code: 'nl', name: 'Dutch' },
      { code: 'sv', name: 'Swedish' },
      { code: 'no', name: 'Norwegian' },
      { code: 'da', name: 'Danish' },
      { code: 'fi', name: 'Finnish' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' },
    ];
  }

  /**
   * Private method to get best MediaRecorder options
   */
  private getBestMediaRecorderOptions(): MediaRecorderOptions {
    const options = [
      { mimeType: 'audio/webm;codecs=opus' },
      { mimeType: 'audio/webm' },
      { mimeType: 'audio/mp4' },
      { mimeType: 'audio/wav' },
    ];

    for (const option of options) {
      if (MediaRecorder.isTypeSupported(option.mimeType)) {
        return option;
      }
    }

    return {}; // Fallback to default
  }

  /**
   * Private method to transcribe audio chunks
   */
  private async transcribeAudioChunks(speaker: 'user' | 'ai') {
    try {
      if (!this.openai || this.audioChunks.length === 0) return;

      const audioBlob = new Blob(this.audioChunks, { 
        type: this.getBestMediaRecorderOptions().mimeType || 'audio/webm' 
      });
      
      // Convert to File object for OpenAI API
      const audioFile = new File([audioBlob], `audio-${Date.now()}.webm`, { 
        type: audioBlob.type 
      });

      // Skip very small audio files (likely silence)
      if (audioFile.size < 1024) return;

      await this.transcribeFile(audioFile, speaker);

    } catch (error) {
      console.error('Error transcribing audio chunks:', error);
      this.handleTranscriptionError(error);
    }
  }

  /**
   * Private method to handle transcription errors
   */
  private handleTranscriptionError(error: any) {
    if (error instanceof OpenAI.APIError) {
      switch (error.status) {
        case 429:
          this.onError('OpenAI API quota exceeded. Please check your plan and billing details at https://platform.openai.com/account/billing');
          break;
        case 401:
          this.onError('OpenAI API authentication failed. Please check your API key configuration.');
          break;
        case 400:
          this.onError('Invalid audio format or request. Please try a different audio file.');
          break;
        case 413:
          this.onError(`Audio file too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
          break;
        default:
          this.onError(`OpenAI API error (${error.status}): ${error.message}`);
      }
    } else if (error.message?.includes('not configured')) {
      this.onError('OpenAI API key not configured. Please add VITE_OPENAI_API_KEY to your .env file.');
    } else {
      this.onError('Failed to transcribe audio. Please try again.');
    }
  }
}

/**
 * Utility function to convert audio file to supported format
 */
export async function convertAudioToSupportedFormat(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    audio.onloadedmetadata = () => {
      // For now, return the original file
      // In a full implementation, you might want to convert using Web Audio API
      resolve(file);
    };
    
    audio.onerror = () => {
      reject(new Error('Failed to load audio file'));
    };
    
    audio.src = URL.createObjectURL(file);
  });
}

/**
 * Utility function to estimate transcription cost
 */
export function estimateTranscriptionCost(durationMinutes: number): number {
  // OpenAI Whisper API pricing: $0.006 per minute
  return durationMinutes * 0.006;
}