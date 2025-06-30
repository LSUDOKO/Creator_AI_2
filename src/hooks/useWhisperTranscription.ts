import { useState, useCallback, useRef, useEffect } from 'react';
import { WhisperTranscriber, WhisperTranscriptionResult, WhisperConfig } from '../lib/whisper';

export interface UseWhisperTranscriptionOptions {
  config?: WhisperConfig;
  autoStart?: boolean;
}

export const useWhisperTranscription = (options: UseWhisperTranscriptionOptions = {}) => {
  const [transcriptions, setTranscriptions] = useState<WhisperTranscriptionResult[]>([]);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const transcriberRef = useRef<WhisperTranscriber | null>(null);
  const userStreamRef = useRef<MediaStream | null>(null);

  const handleTranscription = useCallback((result: WhisperTranscriptionResult) => {
    setTranscriptions(prev => [...prev, result]);
    setTranscriptionError(null); // Clear errors on successful transcription
  }, []);

  const handleError = useCallback((error: string) => {
    setTranscriptionError(error);
    setIsTranscribing(false);
    console.error('Whisper transcription error:', error);
  }, []);

  const initializeTranscriber = useCallback(() => {
    if (!transcriberRef.current) {
      transcriberRef.current = new WhisperTranscriber(
        handleTranscription,
        handleError,
        options.config
      );
    }
  }, [handleTranscription, handleError, options.config]);

  const startTranscription = useCallback(async () => {
    try {
      setIsInitializing(true);
      setTranscriptionError(null);

      // Initialize transcriber if not already done
      initializeTranscriber();

      // Request microphone access with optimal settings
      const userStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
          sampleRate: 16000, // Optimal for Whisper
          channelCount: 1, // Mono audio
        } 
      });
      
      userStreamRef.current = userStream;

      // Start real-time transcription
      await transcriberRef.current!.startRealtimeTranscription(userStream, 'user');
      setIsTranscribing(true);

    } catch (error) {
      console.error('Error starting Whisper transcription:', error);
      
      if (error instanceof DOMException) {
        switch (error.name) {
          case 'NotAllowedError':
            setTranscriptionError('Microphone access denied. Please allow microphone permissions and try again.');
            break;
          case 'NotFoundError':
            setTranscriptionError('No microphone found. Please connect a microphone and try again.');
            break;
          case 'NotReadableError':
            setTranscriptionError('Microphone is being used by another application. Please close other apps and try again.');
            break;
          default:
            setTranscriptionError('Failed to access microphone. Please check your device settings.');
        }
      } else {
        setTranscriptionError('Failed to start transcription. Please try again.');
      }
    } finally {
      setIsInitializing(false);
    }
  }, [initializeTranscriber]);

  const stopTranscription = useCallback(() => {
    if (transcriberRef.current) {
      transcriberRef.current.stopTranscription();
    }

    if (userStreamRef.current) {
      userStreamRef.current.getTracks().forEach(track => track.stop());
      userStreamRef.current = null;
    }

    setIsTranscribing(false);
  }, []);

  const toggleTranscription = useCallback(() => {
    if (isTranscribing) {
      stopTranscription();
    } else {
      startTranscription();
    }
  }, [isTranscribing, startTranscription, stopTranscription]);

  const transcribeFile = useCallback(async (file: File, speaker: 'user' | 'ai' = 'user') => {
    try {
      setTranscriptionError(null);
      initializeTranscriber();
      
      if (transcriberRef.current) {
        return await transcriberRef.current.transcribeFile(file, speaker);
      }
      return null;
    } catch (error) {
      console.error('Error transcribing file:', error);
      setTranscriptionError('Failed to transcribe audio file. Please try again.');
      return null;
    }
  }, [initializeTranscriber]);

  const clearTranscriptions = useCallback(() => {
    setTranscriptions([]);
  }, []);

  const clearError = useCallback(() => {
    setTranscriptionError(null);
  }, []);

  const updateConfig = useCallback((config: Partial<WhisperConfig>) => {
    if (transcriberRef.current) {
      transcriberRef.current.updateConfig(config);
    }
  }, []);

  const exportTranscriptions = useCallback((format: 'txt' | 'json' | 'srt' = 'txt') => {
    if (transcriptions.length === 0) return;

    let content = '';
    let filename = `whisper-transcript-${new Date().toISOString().split('T')[0]}`;

    switch (format) {
      case 'json':
        content = JSON.stringify(transcriptions, null, 2);
        filename += '.json';
        break;
      case 'srt':
        content = transcriptions
          .map((t, index) => {
            const start = t.timestamp.toISOString().substr(11, 12).replace('.', ',');
            const end = new Date(t.timestamp.getTime() + 3000).toISOString().substr(11, 12).replace('.', ',');
            return `${index + 1}\n${start} --> ${end}\n${t.text}\n`;
          })
          .join('\n');
        filename += '.srt';
        break;
      default: // txt
        content = transcriptions
          .map(t => `[${t.timestamp.toLocaleTimeString()}] ${t.speaker === 'user' ? 'You' : 'AI Assistant'}: ${t.text}`)
          .join('\n\n');
        filename += '.txt';
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [transcriptions]);

  const getTranscriptionStats = useCallback(() => {
    const totalWords = transcriptions.reduce((acc, t) => acc + t.text.split(' ').length, 0);
    const userTranscriptions = transcriptions.filter(t => t.speaker === 'user');
    const aiTranscriptions = transcriptions.filter(t => t.speaker === 'ai');
    
    return {
      totalTranscriptions: transcriptions.length,
      totalWords,
      userTranscriptions: userTranscriptions.length,
      aiTranscriptions: aiTranscriptions.length,
      languages: [...new Set(transcriptions.map(t => t.language).filter(Boolean))],
    };
  }, [transcriptions]);

  // Auto-start if requested
  useEffect(() => {
    if (options.autoStart) {
      startTranscription();
    }
  }, [options.autoStart, startTranscription]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopTranscription();
    };
  }, [stopTranscription]);

  return {
    // State
    transcriptions,
    isTranscribing,
    isInitializing,
    transcriptionError,
    
    // Actions
    startTranscription,
    stopTranscription,
    toggleTranscription,
    transcribeFile,
    clearTranscriptions,
    clearError,
    updateConfig,
    exportTranscriptions,
    
    // Utils
    getTranscriptionStats,
    isRecording: isTranscribing,
  };
};