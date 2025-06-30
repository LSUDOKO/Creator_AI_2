import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { AuthKitButton } from '../AuthKitButton';
import { AuthKitSocialConnector } from './AuthKitSocialConnector';
import { 
  Plus,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Calendar,
  Send,
  Loader2,
  MessageSquare,
  Unlink,
  Zap,
  Shield
} from 'lucide-react';
import { usePicaIntegration } from '../../hooks/usePicaIntegration';
import { PicaAPI } from '../../lib/pica';

export const PicaSocialConnector: React.FC = () => {
  const [showAuthKit, setShowAuthKit] = useState(false);
  const {
    connectedAccounts,
    isLoading,
    error,
    connectAccount,
    disconnectAccount,
    postWithAgent,
    postToPlatforms,
    isConnected,
    getAccount,
  } = usePicaIntegration({ autoRefresh: true });

  const [agentPrompt, setAgentPrompt] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [postResults, setPostResults] = useState<any[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
  const [postContent, setPostContent] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');

  const supportedPlatforms = PicaAPI.getSupportedPlatforms();

  const handleConnectPlatform = async (platformId: string) => {
    try {
      await connectAccount(platformId);
    } catch (error) {
      console.error('Failed to connect platform:', error);
    }
  };

  const handleDisconnectPlatform = async (connectorId: string) => {
    try {
      await disconnectAccount(connectorId);
    } catch (error) {
      console.error('Failed to disconnect platform:', error);
    }
  };

  const handleAgentPost = async () => {
    if (!agentPrompt.trim()) return;

    try {
      setIsPosting(true);
      const results = await postWithAgent({
        prompt: agentPrompt,
        contentType: 'text',
      });
      setPostResults(results);
      setAgentPrompt('');
    } catch (error) {
      console.error('Failed to post with agent:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleDirectPost = async () => {
    if (!postContent.trim() || selectedPlatforms.length === 0) return;

    try {
      setIsPosting(true);
      const results = await postToPlatforms({
        content: postContent,
        platforms: selectedPlatforms,
        scheduleTime: scheduleTime ? new Date(scheduleTime) : undefined,
      });
      setPostResults(results);
      setPostContent('');
      setSelectedPlatforms([]);
      setScheduleTime('');
    } catch (error) {
      console.error('Failed to post to platforms:', error);
    } finally {
      setIsPosting(false);
    }
  };

  const togglePlatformSelection = (platformId: string) => {
    setSelectedPlatforms(prev => 
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  if (showAuthKit) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">AuthKit Integration</h2>
            <p className="text-white/60">Secure social media connections with enterprise-grade security</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowAuthKit(false)}
          >
            Back to Pica AI
          </Button>
        </div>
        <AuthKitSocialConnector />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* AuthKit Upgrade Banner */}
      <Card className="border-green-500/30 bg-gradient-to-r from-green-500/10 to-blue-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-green-500 to-blue-500 flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Upgrade to AuthKit</h3>
                <p className="text-sm text-white/70">
                  Enterprise-grade security with OAuth 2.0 and encrypted token storage
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowAuthKit(true)}
              className="bg-gradient-to-r from-green-500 to-blue-500"
            >
              <Shield className="w-4 h-4 mr-2" />
              Try AuthKit
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Zap className="w-6 h-6 text-neon-purple" />
            Social Media Accounts
            <Badge variant="secondary" className="ml-auto">
              Powered by Pica AI
            </Badge>
          </CardTitle>
        </CardHeader>

        <CardContent>
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400" />
              <span className="text-red-400 text-sm">{error}</span>
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {supportedPlatforms.map((platform) => {
              const account = getAccount(platform.id);
              const connected = isConnected(platform.id);
              
              return (
                <motion.div
                  key={platform.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-xl border transition-all ${
                    connected 
                      ? 'bg-green-500/10 border-green-500/20' 
                      : 'bg-white/5 border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{platform.icon}</span>
                      <div>
                        <h3 className="font-medium text-white text-sm">{platform.name}</h3>
                        {account?.username && (
                          <p className="text-xs text-white/60">@{account.username}</p>
                        )}
                      </div>
                    </div>
                    {connected ? (
                      <CheckCircle className="w-5 h-5 text-green-400" />
                    ) : (
                      <Plus className="w-5 h-5 text-white/40" />
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-1">
                      {platform.features.map((feature) => (
                        <Badge key={feature} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>

                    {connected ? (
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => account && handleDisconnectPlatform(account.id)}
                          className="flex-1 text-xs"
                        >
                          <Unlink className="w-3 h-3 mr-1" />
                          Disconnect
                        </Button>
                      </div>
                    ) : (
                      <Button
                        onClick={() => handleConnectPlatform(platform.id)}
                        disabled={isLoading}
                        className="w-full text-xs"
                        size="sm"
                      >
                        {isLoading ? (
                          <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                        ) : (
                          <Plus className="w-3 h-3 mr-1" />
                        )}
                        Connect
                      </Button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* AuthKit CTA */}
          <div className="mt-6 p-4 bg-gradient-to-r from-green-500/10 to-blue-500/10 rounded-xl border border-green-500/20">
            <div className="flex items-center gap-3 mb-2">
              <Shield className="w-5 h-5 text-green-400" />
              <h4 className="font-semibold text-white">Enterprise Security Available</h4>
            </div>
            <p className="text-sm text-white/70 mb-3">
              Upgrade to AuthKit for OAuth 2.0 compliance, encrypted token storage, and enterprise-grade security features.
            </p>
            <div className="flex gap-3">
              <AuthKitButton
                className="bg-gradient-to-r from-green-500 to-blue-500"
                onSuccess={(connection) => {
                  console.log('AuthKit connection successful:', connection);
                }}
                onError={(error) => {
                  console.error('AuthKit connection failed:', error);
                }}
              >
                <Shield className="w-4 h-4 mr-2" />
                Connect with AuthKit
              </AuthKitButton>
              <Button
                variant="outline"
                onClick={() => setShowAuthKit(true)}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Learn More
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Agent Posting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <MessageSquare className="w-6 h-6 text-neon-blue" />
            AI Agent Posting
          </CardTitle>
          <p className="text-sm text-white/60">
            Use natural language to post content across your connected platforms
          </p>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Input
              value={agentPrompt}
              onChange={(e) => setAgentPrompt(e.target.value)}
              placeholder="e.g., 'Post this video to Instagram Reels at 5 PM' or 'Share on LinkedIn and Twitter now'"
              className="bg-white/10 border-white/20 text-white"
            />
            <div className="flex gap-2">
              <Button
                onClick={handleAgentPost}
                disabled={!agentPrompt.trim() || isPosting}
                className="flex-1"
              >
                {isPosting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                Post with AI Agent
              </Button>
            </div>
          </div>

          <div className="text-xs text-white/60 space-y-1">
            <p>💡 Try commands like:</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>"Post this to Instagram Stories and Facebook"</li>
              <li>"Schedule for YouTube Shorts tomorrow at 10 AM"</li>
              <li>"Share on all platforms with trending hashtags"</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Direct Platform Posting */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Send className="w-6 h-6 text-neon-pink" />
            Direct Platform Posting
          </CardTitle>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Content</label>
            <textarea
              value={postContent}
              onChange={(e) => setPostContent(e.target.value)}
              placeholder="Write your post content..."
              className="w-full h-24 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Select Platforms</label>
            <div className="grid grid-cols-3 gap-2">
              {supportedPlatforms
                .filter(platform => isConnected(platform.id))
                .map((platform) => (
                  <Button
                    key={platform.id}
                    variant={selectedPlatforms.includes(platform.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatformSelection(platform.id)}
                    className="text-xs"
                  >
                    <span className="mr-1">{platform.icon}</span>
                    {platform.name}
                  </Button>
                ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-white">Schedule (Optional)</label>
            <Input
              type="datetime-local"
              value={scheduleTime}
              onChange={(e) => setScheduleTime(e.target.value)}
              className="bg-white/10 border-white/20 text-white"
            />
          </div>

          <Button
            onClick={handleDirectPost}
            disabled={!postContent.trim() || selectedPlatforms.length === 0 || isPosting}
            className="w-full"
          >
            {isPosting ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : scheduleTime ? (
              <Calendar className="w-4 h-4 mr-2" />
            ) : (
              <Send className="w-4 h-4 mr-2" />
            )}
            {scheduleTime ? 'Schedule Post' : 'Post Now'}
          </Button>
        </CardContent>
      </Card>

      {/* Post Results */}
      <AnimatePresence>
        {postResults.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                  Post Results
                </CardTitle>
              </CardHeader>

              <CardContent>
                <div className="space-y-3">
                  {postResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-xl border ${
                        result.success
                          ? 'bg-green-500/10 border-green-500/20'
                          : 'bg-red-500/10 border-red-500/20'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {result.success ? (
                            <CheckCircle className="w-4 h-4 text-green-400" />
                          ) : (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          )}
                          <span className="font-medium text-white capitalize">
                            {result.platform}
                          </span>
                        </div>
                        {result.success && (
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      {result.error && (
                        <p className="text-sm text-red-400 mt-1">{result.error}</p>
                      )}
                      {result.scheduledFor && (
                        <p className="text-sm text-white/60 mt-1">
                          Scheduled for: {new Date(result.scheduledFor).toLocaleString()}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setPostResults([])}
                  className="mt-4 w-full"
                >
                  Clear Results
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};