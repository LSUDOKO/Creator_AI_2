import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Upload, Mic, Loader2, Download, Play, Zap } from 'lucide-react';

interface GeneratedVideo {
  video_id: string;
  status: string;
  download_url?: string;
  hosted_url?: string;
  audio_file_name: string;
}

const TAVUS_API_KEY = '2f263fcb5fa44c7ca8ed76d789cdb756';
const TAVUS_REPLICA_ID = 'rb17cf590e15';

export const AudioVideoGenerator: React.FC = () => {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  const generateVideoFromAudio = async () => {
    if (!audioFile) return;

    setIsGeneratingVideo(true);
    try {
      // First, upload the audio file (you'd need to implement file upload)
      const formData = new FormData();
      formData.append('audio', audioFile);
      
      // This is a placeholder - you'd need to implement audio upload to get a URL
      const audioUrl = 'https://example.com/audio.mp3'; // Replace with actual upload logic

      const response = await fetch('https://tavusapi.com/v2/videos', {
        method: 'POST',
        headers: {
          "Content-Type": "application/json",
          "x-api-key": TAVUS_API_KEY
        },
        body: JSON.stringify({
          "replica_id": TAVUS_REPLICA_ID,
          "audio_url": audioUrl
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      const newVideo: GeneratedVideo = {
        video_id: data.video_id,
        status: data.status,
        download_url: data.download_url,
        hosted_url: data.hosted_url,
        audio_file_name: audioFile.name,
      };

      setGeneratedVideos(prev => [newVideo, ...prev]);
      setAudioFile(null);

      // Poll for video completion
      pollVideoStatus(data.video_id);
    } catch (error) {
      console.error('Failed to generate video from audio:', error);
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const response = await fetch(`https://tavusapi.com/v2/videos/${videoId}`, {
          method: 'GET',
          headers: {
            'x-api-key': TAVUS_API_KEY,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const video = await response.json();
        
        setGeneratedVideos(prev => 
          prev.map(v => 
            v.video_id === videoId 
              ? { ...v, status: video.status, download_url: video.download_url, hosted_url: video.hosted_url }
              : v
          )
        );

        if (video.status === 'completed' || video.status === 'failed' || attempts >= maxAttempts) {
          return;
        }

        attempts++;
        setTimeout(poll, 10000); // Poll every 10 seconds
      } catch (error) {
        console.error('Failed to poll video status:', error);
      }
    };

    poll();
  };

  const handleAudioUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioFile(file);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'processing': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      {/* Audio to Video Generator */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Mic className="w-6 h-6 text-neon-purple" />
            Generate Video from Audio
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Audio Upload Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="audio/*"
                onChange={handleAudioUpload}
                className="hidden"
                id="audio-upload"
              />
              <label
                htmlFor="audio-upload"
                className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-2"
              >
                <Upload className="w-4 h-4" />
                {audioFile ? audioFile.name : 'Choose audio file'}
              </label>
            </div>
            
            <Button
              onClick={generateVideoFromAudio}
              disabled={!audioFile || isGeneratingVideo}
              className="w-full"
            >
              {isGeneratingVideo ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Video...
                </>
              ) : (
                <>
                  <Mic className="w-4 h-4 mr-2" />
                  Generate Video
                </>
              )}
            </Button>
          </div>

          {/* Generated Videos List */}
          {generatedVideos.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-white">Generated Videos from Audio</h3>
              <div className="space-y-3">
                {generatedVideos.map((video) => (
                  <motion.div
                    key={video.video_id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-white">
                        Audio: {video.audio_file_name}
                      </span>
                      <span className={`text-sm font-medium ${getStatusColor(video.status)}`}>
                        {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                      </span>
                    </div>
                    
                    <p className="text-xs text-white/60 mb-3">
                      Video ID: {video.video_id.slice(0, 8)}...
                    </p>

                    {video.status === 'completed' && (
                      <div className="flex gap-2">
                        {video.hosted_url && (
                          <Button variant="secondary" size="sm" asChild>
                            <a href={video.hosted_url} target="_blank" rel="noopener noreferrer">
                              <Play className="w-4 h-4 mr-2" />
                              Watch
                            </a>
                          </Button>
                        )}
                        {video.download_url && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={video.download_url} download>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </a>
                          </Button>
                        )}
                      </div>
                    )}

                    {video.status === 'processing' && (
                      <div className="flex items-center gap-2 text-yellow-400">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span className="text-sm">Processing video...</span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};