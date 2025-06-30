import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Mic, 
  MicOff, 
  User, 
  Bot, 
  Download, 
  Trash2, 
  AlertCircle, 
  X, 
  Settings,
  FileAudio,
  BarChart3,
  Languages
} from 'lucide-react';
import { WhisperTranscriptionResult, WhisperTranscriber } from '../lib/whisper';
import { useWhisperTranscription } from '../hooks/useWhisperTranscription';

interface WhisperTranscriptionPanelProps {
  className?: string;
  showSettings?: boolean;
  autoStart?: boolean;
}

export const WhisperTranscriptionPanel: React.FC<WhisperTranscriptionPanelProps> = ({
  className = '',
  showSettings = true,
  autoStart = false,
}) => {
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('en');
  const [temperature, setTemperature] = useState(0.2);
  const scrollRef = useRef<HTMLDivElement>(null);

  const {
    transcriptions,
    isTranscribing,
    isInitializing,
    transcriptionError,
    startTranscription,
    stopTranscription,
    toggleTranscription,
    transcribeFile,
    clearTranscriptions,
    clearError,
    updateConfig,
    exportTranscriptions,
    getTranscriptionStats,
  } = useWhisperTranscription({
    config: {
      language: selectedLanguage,
      temperature,
      response_format: 'verbose_json',
    },
    autoStart,
  });

  const stats = getTranscriptionStats();

  // Auto-scroll to bottom when new transcriptions arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [transcriptions]);

  // Update config when settings change
  useEffect(() => {
    updateConfig({
      language: selectedLanguage,
      temperature,
    });
  }, [selectedLanguage, temperature, updateConfig]);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      await transcribeFile(file, 'user');
    }
    // Reset input
    event.target.value = '';
  };

  const supportedLanguages = WhisperTranscriber.getSupportedLanguages();

  return (
    <Card className={`h-full flex flex-col ${className}`}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <Mic className="w-5 h-5 text-neon-blue" />
            Whisper Transcription
          </CardTitle>
          <div className="flex items-center gap-2">
            {showSettings && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="text-white/60 hover:text-white"
              >
                <Settings className="w-4 h-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTranscription}
              disabled={!!transcriptionError || isInitializing}
              className={`${
                isTranscribing 
                  ? 'text-red-400 hover:text-red-300' 
                  : 'text-green-400 hover:text-green-300'
              } ${(transcriptionError || isInitializing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isInitializing ? (
                <>
                  <div className="w-4 h-4 mr-1 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Init
                </>
              ) : isTranscribing ? (
                <>
                  <MicOff className="w-4 h-4 mr-1" />
                  Stop
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-1" />
                  Start
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Status Indicator */}
        {isTranscribing && !transcriptionError && (
          <div className="flex items-center gap-2 text-sm text-green-400">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Recording with Whisper AI...
          </div>
        )}

        {/* Advanced Settings */}
        <AnimatePresence>
          {showAdvancedSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-3 border-t border-white/10"
            >
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-white/70 mb-1 block">Language</label>
                  <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {supportedLanguages.map((lang) => (
                        <SelectItem key={lang.code} value={lang.code}>
                          {lang.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-xs text-white/70 mb-1 block">Temperature</label>
                  <Select value={temperature.toString()} onValueChange={(v) => setTemperature(parseFloat(v))}>
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">0 (Deterministic)</SelectItem>
                      <SelectItem value="0.2">0.2 (Low creativity)</SelectItem>
                      <SelectItem value="0.5">0.5 (Balanced)</SelectItem>
                      <SelectItem value="0.8">0.8 (High creativity)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex gap-2">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="audio-file-upload"
                />
                <label htmlFor="audio-file-upload">
                  <Button variant="outline" size="sm" className="text-xs" asChild>
                    <span>
                      <FileAudio className="w-3 h-3 mr-1" />
                      Upload Audio
                    </span>
                  </Button>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error Display */}
        {transcriptionError && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 mt-2">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-red-400 font-medium mb-1">Whisper Error</p>
                <p className="text-xs text-red-300 leading-relaxed">{transcriptionError}</p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Stats and Actions */}
        {transcriptions.length > 0 && (
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-4 text-xs text-white/60">
              <span className="flex items-center gap-1">
                <BarChart3 className="w-3 h-3" />
                {stats.totalTranscriptions} segments
              </span>
              <span>{stats.totalWords} words</span>
              {stats.languages.length > 0 && (
                <span className="flex items-center gap-1">
                  <Languages className="w-3 h-3" />
                  {stats.languages.join(', ')}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => exportTranscriptions('txt')}
                className="text-blue-400 hover:text-blue-300 p-1"
              >
                <Download className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={clearTranscriptions}
                className="text-red-400 hover:text-red-300 p-1"
              >
                <Trash2 className="w-3 h-3" />
              </Button>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        <div 
          ref={scrollRef}
          className="h-full overflow-y-auto p-4 space-y-3"
        >
          <AnimatePresence>
            {transcriptions.length === 0 ? (
              <div className="flex items-center justify-center h-full text-white/60">
                <div className="text-center">
                  <Mic className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <p className="mb-2">Start Whisper transcription</p>
                  <p className="text-xs text-white/40">
                    Powered by OpenAI Whisper AI
                  </p>
                </div>
              </div>
            ) : (
              transcriptions.map((transcription, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 p-3 rounded-xl ${
                    transcription.speaker === 'user'
                      ? 'bg-blue-500/10 border border-blue-500/20'
                      : 'bg-purple-500/10 border border-purple-500/20'
                  }`}
                >
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    transcription.speaker === 'user'
                      ? 'bg-blue-500/20 text-blue-400'
                      : 'bg-purple-500/20 text-purple-400'
                  }`}>
                    {transcription.speaker === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-sm font-medium ${
                        transcription.speaker === 'user' ? 'text-blue-400' : 'text-purple-400'
                      }`}>
                        {transcription.speaker === 'user' ? 'You' : 'AI Assistant'}
                      </span>
                      <span className="text-xs text-white/50">
                        {formatTime(transcription.timestamp)}
                      </span>
                      {transcription.language && (
                        <span className="text-xs text-white/40 bg-white/10 px-1 rounded">
                          {transcription.language}
                        </span>
                      )}
                    </div>
                    <p className="text-white text-sm leading-relaxed">
                      {transcription.text}
                    </p>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </CardContent>
    </Card>
  );
};