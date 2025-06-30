import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Video, Loader2, Download, Play } from 'lucide-react';
import { TavusAPI } from '../../lib/tavus';

const TAVUS_API_KEY = '2f263fcb5fa44c7ca8ed76d789cdb756';
const TAVUS_REPLICA_ID = 'r9fa0878977a';

interface GeneratedVideo {
  video_id: string;
  status: string;
  download_url?: string;
  hosted_url?: string;
  script: string;
}

export const VideoGenerator: React.FC = () => {
  const [script, setScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideos, setGeneratedVideos] = useState<GeneratedVideo[]>([]);

  const generateVideo = async () => {
    if (!script.trim()) return;

    setIsGenerating(true);
    try {
      const tavus = new TavusAPI(TAVUS_API_KEY);
      const video = await tavus.createVideo({
        replica_id: TAVUS_REPLICA_ID,
        script: script.trim(),
      });

      const newVideo: GeneratedVideo = {
        video_id: video.video_id,
        status: video.status,
        download_url: video.download_url,
        hosted_url: video.hosted_url,
        script: script.trim(),
      };

      setGeneratedVideos(prev => [newVideo, ...prev]);
      setScript('');

      // Poll for video completion
      pollVideoStatus(video.video_id);
    } catch (error) {
      console.error('Failed to generate video:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const pollVideoStatus = async (videoId: string) => {
    const tavus = new TavusAPI(TAVUS_API_KEY);
    const maxAttempts = 30; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      try {
        const video = await tavus.getVideo(videoId);
        
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'text-green-400';
      case 'failed': return 'text-red-400';
      case 'processing': return 'text-yellow-400';
      default: return 'text-blue-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <Video className="w-6 h-6 text-neon-blue" />
          AI Video Generator
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Video Generation Form */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="script">Video Script</Label>
            <textarea
              id="script"
              value={script}
              onChange={(e) => setScript(e.target.value)}
              placeholder="Enter your video script here..."
              className="w-full h-32 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
          </div>

          <Button
            onClick={generateVideo}
            disabled={isGenerating || !script.trim()}
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
        </div>

        {/* Generated Videos List */}
        {generatedVideos.length > 0 && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-white">Generated Videos</h3>
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
                      Video ID: {video.video_id.slice(0, 8)}...
                    </span>
                    <span className={`text-sm font-medium ${getStatusColor(video.status)}`}>
                      {video.status.charAt(0).toUpperCase() + video.status.slice(1)}
                    </span>
                  </div>
                  
                  <p className="text-sm text-white/70 mb-3 line-clamp-2">
                    {video.script}
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
  );
};