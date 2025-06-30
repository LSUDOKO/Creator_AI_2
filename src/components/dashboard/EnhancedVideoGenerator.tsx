import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { 
  Video, 
  Loader2, 
  Download, 
  Play, 
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Upload,
  FileText,
  Mic
} from 'lucide-react';
import { TavusAPI } from '../../lib/tavus';

const TAVUS_API_KEY = '2f263fcb5fa44c7ca8ed76d789cdb756';

interface GeneratedVideo {
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  hosted_url?: string;
  script?: string;
  audio_file_name?: string;
  replica_id: string;
  progress: number;
  created_at: Date;
  estimated_completion?: Date;
}

interface Replica {
  replica_id: string;
  replica_name: string;
  thumbnail_image_url?: string;
  status: 'ready' | 'training' | 'failed';
  voice_id?: string;
  created_at: string;
}

export const EnhancedVideoGenerator: React.FC = () => {
  const [script, setScript] = useState('');
  const [selectedReplica, setSelectedReplica] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [generationType, setGenerationType] = useState<'script' | 'audio'>('script');
  
  // Video player states
  const [playingVideo, setPlayingVideo] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(false);
  const videoRefs = useRef<{ [key: string]: HTMLVideoElement }>({});

  // Updated replicas with your specific IDs
  const [replicas] = useState<Replica[]>([
    {
      replica_id: 'r92debe21318',
      replica_name: 'Professional Sarah',
      thumbnail_image_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'ready',
      voice_id: 'voice_001',
      created_at: '2024-01-15T10:00:00Z',
    },
    {
      replica_id: 'r9d30b0e55ac',
      replica_name: 'Creative Alex',
      thumbnail_image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'ready',
      voice_id: 'voice_002',
      created_at: '2024-01-16T14:30:00Z',
    },
    {
      replica_id: 'r93183fb36c0',
      replica_name: 'Business Marcus',
      thumbnail_image_url: 'https://images.pexels.com/photos/2182970/pexels-photo-2182970.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'ready',
      voice_id: 'voice_003',
      created_at: '2024-01-17T09:15:00Z',
    },
    {
      replica_id: 'r13e554ebaa3',
      replica_name: 'Tech Expert Emma',
      thumbnail_image_url: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=200',
      status: 'ready',
      voice_id: 'voice_004',
      created_at: '2024-01-18T11:45:00Z',
    },
  ]);

  const generateVideo = async () => {
    if (generationType === 'script' && !script.trim()) return;
    if (generationType === 'audio' && !audioFile) return;
    if (!selectedReplica) return;

    setIsGenerating(true);
    try {
      const tavus = new TavusAPI(TAVUS_API_KEY);
      
      let video;
      if (generationType === 'script') {
        video = await tavus.createVideo({
          replica_id: selectedReplica,
          script: script.trim(),
        });
      } else {
        // For audio generation, we'd need to upload the file first
        // This is a simplified version
        video = await tavus.createVideoFromAudio({
          replica_id: selectedReplica,
          audio_url: 'placeholder_url', // Would be actual uploaded file URL
        });
      }

      const newVideo: GeneratedVideo = {
        video_id: video.video_id,
        status: video.status,
        download_url: video.download_url,
        hosted_url: video.hosted_url,
        script: generationType === 'script' ? script.trim() : undefined,
        audio_file_name: generationType === 'audio' ? audioFile?.name : undefined,
        replica_id: selectedReplica,
        progress: 0,
        created_at: new Date(),
        estimated_completion: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes estimate
      };

      setGeneratedVideos(prev => [newVideo, ...prev]);
      setScript('');
      setAudioFile(null);

      // Start progress polling
      pollVideoProgress(video.video_id);
    } catch (error) {
      console.error('Failed to generate video:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const pollVideoProgress = async (videoId: string) => {
    const tavus = new TavusAPI(TAVUS_API_KEY);
    const maxAttempts = 60; // 10 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const video = await tavus.getVideo(videoId);
        
        // Calculate progress based on status and time elapsed
        const progress = video.status === 'completed' ? 100 :
                        video.status === 'failed' ? 0 :
                        Math.min(95, (attempts / maxAttempts) * 100);
        
        setGeneratedVideos(prev => 
          prev.map(v => 
            v.video_id === videoId 
              ? { 
                  ...v, 
                  status: video.status, 
                  download_url: video.download_url, 
                  hosted_url: video.hosted_url,
                  progress 
                }
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

  const toggleVideoPlay = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    if (playingVideo === videoId) {
      video.pause();
      setPlayingVideo(null);
    } else {
      // Pause other videos
      Object.values(videoRefs.current).forEach(v => v.pause());
      video.play();
      setPlayingVideo(videoId);
    }
  };

  const toggleMute = (videoId: string) => {
    const video = videoRefs.current[videoId];
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'processing': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  const getProgressColor = (progress: number) => {
    if (progress < 30) return 'bg-blue-500';
    if (progress < 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Video className="w-6 h-6 text-neon-blue" />
            AI Video Generator
            <span className="text-sm font-normal text-white/60">Powered by Tavus</span>
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Generation Type Selection */}
          <div className="space-y-3">
            <Label>Generation Method</Label>
            <div className="flex gap-3">
              <Button
                variant={generationType === 'script' ? 'default' : 'outline'}
                onClick={() => setGenerationType('script')}
                className="flex-1"
              >
                <FileText className="w-4 h-4 mr-2" />
                From Script
              </Button>
              <Button
                variant={generationType === 'audio' ? 'default' : 'outline'}
                onClick={() => setGenerationType('audio')}
                className="flex-1"
              >
                <Mic className="w-4 h-4 mr-2" />
                From Audio
              </Button>
            </div>
          </div>

          {/* Replica Selection */}
          <div className="space-y-3">
            <Label>Choose AI Replica</Label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {replicas.map((replica) => (
                <motion.div
                  key={replica.replica_id}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${
                    selectedReplica === replica.replica_id
                      ? 'border-neon-blue bg-neon-blue/10'
                      : 'border-white/20 bg-white/5 hover:border-white/40'
                  }`}
                  onClick={() => setSelectedReplica(replica.replica_id)}
                >
                  <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full overflow-hidden mb-3">
                      <img
                        src={replica.thumbnail_image_url}
                        alt={replica.replica_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <h3 className="font-medium text-white text-sm">{replica.replica_name}</h3>
                    <p className="text-xs text-white/60 mt-1">
                      {replica.status === 'ready' ? '✅ Ready' : '⏳ Training'}
                    </p>
                    <p className="text-xs text-white/40 mt-1">
                      ID: {replica.replica_id}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Content Input */}
          {generationType === 'script' ? (
            <div className="space-y-2">
              <Label htmlFor="script">Video Script</Label>
              <textarea
                id="script"
                value={script}
                onChange={(e) => setScript(e.target.value)}
                placeholder="Enter your video script here..."
                className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
              />
              <p className="text-xs text-white/60">
                💡 Tip: Keep scripts under 2 minutes for best results
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="audio">Audio File</Label>
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
              <p className="text-xs text-white/60">
                💡 Supported formats: MP3, WAV, M4A (max 25MB)
              </p>
            </div>
          )}

          <Button
            onClick={generateVideo}
            disabled={
              isGenerating || 
              !selectedReplica || 
              (generationType === 'script' && !script.trim()) ||
              (generationType === 'audio' && !audioFile)
            }
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating Video...
              </>
            ) : (
              <>
                <Video className="w-4 h-4 mr-2" />
                Generate AI Video
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Generated Videos List */}
      <AnimatePresence>
        {generatedVideos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Generated Videos</CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-6">
                  {generatedVideos.map((video) => {
                    const replica = replicas.find(r => r.replica_id === video.replica_id);
                    
                    return (
                      <motion.div
                        key={video.video_id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-6 bg-white/5 rounded-xl border border-white/10"
                      >
                        <div className="flex items-start gap-4">
                          {/* Replica Avatar */}
                          <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                            <img
                              src={replica?.thumbnail_image_url}
                              alt={replica?.replica_name}
                              className="w-full h-full object-cover"
                            />
                          </div>

                          <div className="flex-1 min-w-0">
                            {/* Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h3 className="font-medium text-white">
                                  {replica?.replica_name} Video
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                  <span>ID: {video.video_id.slice(0, 8)}...</span>
                                  <span>•</span>
                                  <span>Replica: {video.replica_id}</span>
                                </div>
                              </div>
                              <span className={`text-sm font-medium ${getStatusColor(video.status)}`}>
                                {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                              </span>
                            </div>

                            {/* Progress Bar */}
                            {video.status === 'processing' && (
                              <div className="mb-4">
                                <div className="flex items-center justify-between text-sm mb-2">
                                  <span className="text-white/70">Generating video...</span>
                                  <span className="text-white/70">{Math.round(video.progress)}%</span>
                                </div>
                                <div className="w-full bg-white/10 rounded-full h-2">
                                  <motion.div
                                    className={`h-2 rounded-full ${getProgressColor(video.progress)}`}
                                    initial={{ width: 0 }}
                                    animate={{ width: `${video.progress}%` }}
                                    transition={{ duration: 0.5 }}
                                  />
                                </div>
                                {video.estimated_completion && (
                                  <p className="text-xs text-white/50 mt-1">
                                    Estimated completion: {video.estimated_completion.toLocaleTimeString()}
                                  </p>
                                )}
                              </div>
                            )}

                            {/* Content Preview */}
                            {video.script && (
                              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                                <p className="text-sm text-white/80 line-clamp-3">
                                  {video.script}
                                </p>
                              </div>
                            )}

                            {video.audio_file_name && (
                              <div className="mb-4 p-3 bg-white/5 rounded-lg">
                                <p className="text-sm text-white/80 flex items-center gap-2">
                                  <Mic className="w-4 h-4" />
                                  Audio: {video.audio_file_name}
                                </p>
                              </div>
                            )}

                            {/* Video Player */}
                            {video.status === 'completed' && video.hosted_url && (
                              <div className="mb-4">
                                <div className="relative aspect-video bg-black rounded-lg overflow-hidden">
                                  <video
                                    ref={(el) => {
                                      if (el) videoRefs.current[video.video_id] = el;
                                    }}
                                    src={video.hosted_url}
                                    className="w-full h-full object-cover"
                                    onEnded={() => setPlayingVideo(null)}
                                  />
                                  
                                  {/* Video Controls Overlay */}
                                  <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <div className="flex items-center gap-4">
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleVideoPlay(video.video_id)}
                                        className="bg-black/50 hover:bg-black/70"
                                      >
                                        {playingVideo === video.video_id ? (
                                          <Pause className="w-6 h-6" />
                                        ) : (
                                          <Play className="w-6 h-6" />
                                        )}
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => toggleMute(video.video_id)}
                                        className="bg-black/50 hover:bg-black/70"
                                      >
                                        {isMuted ? (
                                          <VolumeX className="w-5 h-5" />
                                        ) : (
                                          <Volume2 className="w-5 h-5" />
                                        )}
                                      </Button>
                                      
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => {
                                          const videoEl = videoRefs.current[video.video_id] as HTMLVideoElement | undefined;
                                          if (videoEl) videoEl.requestFullscreen();
                                        }}
                                        className="bg-black/50 hover:bg-black/70"
                                      >
                                        <Maximize className="w-5 h-5" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2">
                              {video.status === 'completed' && (
                                <>
                                  {video.hosted_url && (
                                    <Button variant="secondary" size="sm" asChild>
                                      <a href={video.hosted_url} target="_blank" rel="noopener noreferrer">
                                        <Play className="w-4 h-4 mr-2" />
                                        Open in New Tab
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
                                </>
                              )}

                              {video.status === 'processing' && (
                                <div className="flex items-center gap-2 text-yellow-400">
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                  <span className="text-sm">Processing video...</span>
                                </div>
                              )}

                              {video.status === 'failed' && (
                                <div className="flex items-center gap-2 text-red-400">
                                  <span className="text-sm">Generation failed</span>
                                  <Button variant="outline" size="sm">
                                    Retry
                                  </Button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};