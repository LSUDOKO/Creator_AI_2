// ElevenLabs API integration for transcription
const ELEVENLABS_API_KEY = import.meta.env.VITE_ELEVENLABS_API_KEY;
const ELEVENLABS_API_BASE = 'https://api.elevenlabs.io/v1';
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB limit for ElevenLabs
const CHUNK_DURATION = 3000; // 3 seconds for real-time transcription

export interface ElevenLabsTranscriptionResult {
  text: string;
  speaker: 'user' | 'ai';
  timestamp: Date;
  confidence?: number;
  language?: string;
  duration?: number;
}

export interface ElevenLabsConfig {
  language?: string;
  model?: 'whisper-1' | 'whisper-large';
  optimize_streaming_latency?: number;
  output_format?: 'json' | 'text';
}

export class ElevenLabsTranscriber {
  private mediaRecorder: MediaRecorder | null = null;
  private audioChunks: Blob[] = [];
  private isRecording = false;
  private onTranscription: (result: ElevenLabsTranscriptionResult) => void;
  private onError: (error: string) => void;
  private recordingInterval: NodeJS.Timeout | null = null;
  private config: ElevenLabsConfig;

  constructor(
    onTranscription: (result: ElevenLabsTranscriptionResult) => void,
    onError: (error: string) => void,
    config: ElevenLabsConfig = {}
  ) {
    this.onTranscription = onTranscription;
    this.onError = onError;
    this.config = {
      language: 'en',
      model: 'whisper-1',
      optimize_streaming_latency: 3,
      output_format: 'json',
      ...config
    };

    if (!ELEVENLABS_API_KEY) {
      console.warn('ElevenLabs API key not found. Set VITE_ELEVENLABS_API_KEY in your .env file.');
    }
  }

  /**
   * Start real-time transcription from a media stream
   */
  async startRealtimeTranscription(stream: MediaStream, speaker: 'user' | 'ai' = 'user') {
    try {
      if (!ELEVENLABS_API_KEY) {
        this.onError('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
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
      console.error('Error starting ElevenLabs transcription:', error);
      this.onError('Failed to start voice transcription. Please check your microphone permissions.');
    }
  }

  /**
   * Transcribe a single audio file using ElevenLabs Speech-to-Text
   */
  async transcribeFile(audioFile: File, speaker: 'user' | 'ai' = 'user'): Promise<ElevenLabsTranscriptionResult | null> {
    try {
      if (!ELEVENLABS_API_KEY) {
        throw new Error('ElevenLabs API key not configured');
      }

      if (audioFile.size > MAX_FILE_SIZE) {
        throw new Error(`File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`);
      }

      // Create FormData for file upload
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      // Use correct parameter name for model
      formData.append('model_id', this.config.model || 'whisper-1');
      
      // Only add optional parameters if they are set
      if (this.config.language) {
        formData.append('language', this.config.language);
      }
      
      if (this.config.optimize_streaming_latency !== undefined) {
        formData.append('optimize_streaming_latency', this.config.optimize_streaming_latency.toString());
      }

      if (this.config.output_format) {
        formData.append('output_format', this.config.output_format);
      }

      const response = await fetch(`${ELEVENLABS_API_BASE}/speech-to-text`, {
        method: 'POST',
        headers: {
          'xi-api-key': ELEVENLABS_API_KEY,
        },
        body: formData,
      });

      if (!response.ok) {
        let errorMessage = `ElevenLabs API error (${response.status}): ${response.statusText}`;
        
        try {
          const errorData = await response.json();
          console.error('ElevenLabs API error response:', errorData);
          
          // Extract detailed error message from various possible fields
          if (errorData.detail) {
            if (typeof errorData.detail === 'string') {
              errorMessage = `ElevenLabs API error (${response.status}): ${errorData.detail}`;
            } else if (Array.isArray(errorData.detail)) {
              // Handle validation errors that come as arrays
              const details = errorData.detail.map((err: any) => {
                if (typeof err === 'string') return err;
                if (err.msg) return err.msg;
                if (err.message) return err.message;
                if (err.loc && err.msg) return `${err.loc.join('.')}: ${err.msg}`;
                return JSON.stringify(err);
              }).join(', ');
              errorMessage = `ElevenLabs API validation error (${response.status}): ${details}`;
            } else if (typeof errorData.detail === 'object') {
              // Handle object-type detail
              if (errorData.detail.message) {
                errorMessage = `ElevenLabs API error (${response.status}): ${errorData.detail.message}`;
              } else {
                errorMessage = `ElevenLabs API error (${response.status}): ${JSON.stringify(errorData.detail)}`;
              }
            }
          } else if (errorData.message) {
            errorMessage = `ElevenLabs API error (${response.status}): ${errorData.message}`;
          } else if (errorData.error) {
            if (typeof errorData.error === 'string') {
              errorMessage = `ElevenLabs API error (${response.status}): ${errorData.error}`;
            } else {
              errorMessage = `ElevenLabs API error (${response.status}): ${JSON.stringify(errorData.error)}`;
            }
          } else {
            // Fallback to full error object
            errorMessage = `ElevenLabs API error (${response.status}): ${JSON.stringify(errorData)}`;
          }
        } catch (parseError) {
          // If we can't parse the error response, use the original message
          console.warn('Failed to parse ElevenLabs error response:', parseError);
          errorMessage = `ElevenLabs API error (${response.status}): Unable to parse error details`;
        }
        
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      if (result.text && result.text.trim().length > 0) {
        const transcriptionResult: ElevenLabsTranscriptionResult = {
          text: result.text.trim(),
          speaker,
          timestamp: new Date(),
          confidence: result.confidence,
          language: result.language || this.config.language,
          duration: result.duration,
        };
        
        this.onTranscription(transcriptionResult);
        return transcriptionResult;
      }

      return null;

    } catch (error) {
      console.error('Error transcribing audio file with ElevenLabs:', error);
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
  updateConfig(config: Partial<ElevenLabsConfig>) {
    this.config = { ...this.config, ...config };
  }

  /**
   * Get supported languages for ElevenLabs Speech-to-Text
   */
  static getSupportedLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'es', name: 'Spanish' },
      { code: 'fr', name: 'French' },
      { code: 'de', name: 'German' },
      { code: 'it', name: 'Italian' },
      { code: 'pt', name: 'Portuguese' },
      { code: 'pl', name: 'Polish' },
      { code: 'tr', name: 'Turkish' },
      { code: 'ru', name: 'Russian' },
      { code: 'nl', name: 'Dutch' },
      { code: 'cs', name: 'Czech' },
      { code: 'ar', name: 'Arabic' },
      { code: 'zh', name: 'Chinese (Mandarin)' },
      { code: 'ja', name: 'Japanese' },
      { code: 'hu', name: 'Hungarian' },
      { code: 'ko', name: 'Korean' },
      { code: 'hi', name: 'Hindi' },
    ];
  }

  /**
   * Get available models
   */
  static getAvailableModels(): { id: string; name: string; description: string }[] {
    return [
      {
        id: 'whisper-1',
        name: 'Whisper v1',
        description: 'Fast and accurate speech recognition'
      },
      {
        id: 'whisper-large',
        name: 'Whisper Large',
        description: 'Higher accuracy, slower processing'
      }
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
      if (!ELEVENLABS_API_KEY || this.audioChunks.length === 0) return;

      const audioBlob = new Blob(this.audioChunks, { 
        type: this.getBestMediaRecorderOptions().mimeType || 'audio/webm' 
      });
      
      // Convert to File object for ElevenLabs API
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
    const errorMessage = error.message || error.toString();
    
    if (errorMessage.includes('422')) {
      // Extract the detailed error message for 422 errors
      const match = errorMessage.match(/ElevenLabs API (?:validation )?error \(422\): (.+)/);
      if (match && match[1]) {
        this.onError(`ElevenLabs validation error: ${match[1]}`);
      } else {
        this.onError('ElevenLabs API validation error. Please check your audio format and parameters.');
      }
    } else if (errorMessage.includes('429')) {
      this.onError('ElevenLabs API rate limit exceeded. Please wait a moment and try again.');
    } else if (errorMessage.includes('401') || errorMessage.includes('403')) {
      this.onError('ElevenLabs API authentication failed. Please check your API key configuration.');
    } else if (errorMessage.includes('400')) {
      this.onError('Invalid audio format or request. Please try a different audio file.');
    } else if (errorMessage.includes('413')) {
      this.onError(`Audio file too large. Maximum size is ${MAX_FILE_SIZE / (1024 * 1024)}MB.`);
    } else if (errorMessage.includes('not configured')) {
      this.onError('ElevenLabs API key not configured. Please add VITE_ELEVENLABS_API_KEY to your .env file.');
    } else {
      // For any other errors, try to extract meaningful information
      if (errorMessage.includes('ElevenLabs API error')) {
        this.onError(errorMessage);
      } else {
        this.onError('Failed to transcribe audio with ElevenLabs. Please try again.');
      }
    }
  }
}

/**
 * Utility function to convert audio file to supported format
 */
export async function convertAudioToSupportedFormat(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    const audio = new Audio();
    
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
 * Utility function to estimate transcription cost (ElevenLabs pricing)
 */
export function estimateTranscriptionCost(durationMinutes: number): number {
  // ElevenLabs Speech-to-Text pricing: varies by plan
  // This is an estimate - check current pricing on ElevenLabs website
  return durationMinutes * 0.003; // Estimated $0.003 per minute
}

/**
 * Check ElevenLabs API status
 */
export async function checkElevenLabsStatus(): Promise<{ status: 'ok' | 'error'; message?: string }> {
  try {
    if (!ELEVENLABS_API_KEY) {
      return { status: 'error', message: 'API key not configured' };
    }

    const response = await fetch(`${ELEVENLABS_API_BASE}/user`, {
      headers: {
        'xi-api-key': ELEVENLABS_API_KEY,
      },
    });

    if (response.ok) {
      return { status: 'ok' };
    } else {
      return { status: 'error', message: `API error: ${response.status}` };
    }
  } catch (error) {
    return { status: 'error', message: 'Network error' };
  }
}