import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { 
  Twitter, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Facebook, 
  MessageCircle,
  Plus,
  CheckCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Heart,
  Zap,
  ExternalLink
} from 'lucide-react';
import { PicaSocialConnector } from './PicaSocialConnector';

interface SocialAccount {
  platform: string;
  username: string;
  connected: boolean;
  followers: number;
  engagement: number;
  lastPost: string;
}

interface PlatformConfig {
  name: string;
  icon: React.ComponentType<any>;
  color: string;
  bgColor: string;
}

const platforms: Record<string, PlatformConfig> = {
  twitter: {
    name: 'Twitter/X',
    icon: Twitter,
    color: 'text-blue-400',
    bgColor: 'bg-blue-400/10',
  },
  instagram: {
    name: 'Instagram',
    icon: Instagram,
    color: 'text-pink-400',
    bgColor: 'bg-pink-400/10',
  },
  youtube: {
    name: 'YouTube',
    icon: Youtube,
    color: 'text-red-400',
    bgColor: 'bg-red-400/10',
  },
  linkedin: {
    name: 'LinkedIn',
    icon: Linkedin,
    color: 'text-blue-600',
    bgColor: 'bg-blue-600/10',
  },
  facebook: {
    name: 'Facebook',
    icon: Facebook,
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  whatsapp: {
    name: 'WhatsApp',
    icon: MessageCircle,
    color: 'text-green-400',
    bgColor: 'bg-green-400/10',
  },
};

export const SocialMediaConnector: React.FC = () => {
  const [showPicaIntegration, setShowPicaIntegration] = useState(false);
  const [connectedAccounts] = useState<SocialAccount[]>([
    {
      platform: 'instagram',
      username: '@creator_pilot',
      connected: true,
      followers: 12500,
      engagement: 4.2,
      lastPost: '2 hours ago',
    },
    {
      platform: 'youtube',
      username: 'CreatorPilot Channel',
      connected: true,
      followers: 8900,
      engagement: 6.8,
      lastPost: '1 day ago',
    },
  ]);

  const [insights] = useState({
    totalReach: 156000,
    avgEngagement: 5.5,
    topPerformingPlatform: 'youtube',
    suggestedPostTime: '6:00 PM',
    trendingHashtags: ['#AI', '#ContentCreator', '#VideoMarketing'],
  });

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const unconnectedPlatforms = Object.keys(platforms).filter(
    platform => !connectedAccounts.some(account => account.platform === platform)
  );

  if (showPicaIntegration) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Pica AI Integration</h2>
            <p className="text-white/60">Advanced social media automation with AI</p>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowPicaIntegration(false)}
          >
            Back to Overview
          </Button>
        </div>
        <PicaSocialConnector />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Pica Integration CTA */}
      <Card className="border-neon-purple/30 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-gradient flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Upgrade to Pica AI</h3>
                <p className="text-sm text-white/70">
                  Automate posting with natural language commands
                </p>
              </div>
            </div>
            <Button
              onClick={() => setShowPicaIntegration(true)}
              className="bg-neon-gradient"
            >
              <Zap className="w-4 h-4 mr-2" />
              Try Pica AI
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <CheckCircle className="w-6 h-6 text-green-400" />
            Connected Accounts
          </CardTitle>
        </CardHeader>

        <CardContent>
          {connectedAccounts.length > 0 ? (
            <div className="space-y-4">
              {connectedAccounts.map((account) => {
                const platform = platforms[account.platform];
                const Icon = platform.icon;
                
                return (
                  <motion.div
                    key={account.platform}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-xl ${platform.bgColor} flex items-center justify-center`}>
                        <Icon className={`w-6 h-6 ${platform.color}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{platform.name}</h3>
                        <p className="text-sm text-white/60">{account.username}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="text-lg font-semibold text-white">
                          {formatNumber(account.followers)}
                        </p>
                        <p className="text-xs text-white/60">Followers</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold text-green-400">
                          {account.engagement}%
                        </p>
                        <p className="text-xs text-white/60">Engagement</p>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {account.lastPost}
                      </Badge>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <p className="text-white/60 text-center py-8">
              No accounts connected yet. Connect your social media accounts to get started.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Analytics Insights */}
      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-neon-blue" />
              Analytics & Insights
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <Users className="w-8 h-8 text-neon-blue mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{formatNumber(insights.totalReach)}</p>
                <p className="text-sm text-white/60">Total Reach</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <Heart className="w-8 h-8 text-neon-pink mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{insights.avgEngagement}%</p>
                <p className="text-sm text-white/60">Avg Engagement</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <TrendingUp className="w-8 h-8 text-green-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white capitalize">{insights.topPerformingPlatform}</p>
                <p className="text-sm text-white/60">Top Platform</p>
              </div>
              <div className="text-center p-4 bg-white/5 rounded-xl">
                <AlertCircle className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
                <p className="text-lg font-bold text-white">{insights.suggestedPostTime}</p>
                <p className="text-sm text-white/60">Best Time</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-white mb-2">AI Recommendations</h4>
                <div className="space-y-2">
                  <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20">
                    <p className="text-sm text-white">
                      📈 Your YouTube engagement is 40% higher than average. Consider posting more video content.
                    </p>
                  </div>
                  <div className="p-3 bg-green-500/10 rounded-xl border border-green-500/20">
                    <p className="text-sm text-white">
                      ⏰ Post at {insights.suggestedPostTime} for maximum engagement based on your audience activity.
                    </p>
                  </div>
                  <div className="p-3 bg-purple-500/10 rounded-xl border border-purple-500/20">
                    <p className="text-sm text-white">
                      🏷️ Trending hashtags: {insights.trendingHashtags.join(', ')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Connect New Accounts */}
      {unconnectedPlatforms.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Plus className="w-6 h-6 text-neon-purple" />
              Connect More Accounts
            </CardTitle>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {unconnectedPlatforms.map((platformKey) => {
                const platform = platforms[platformKey];
                const Icon = platform.icon;
                
                return (
                  <Button
                    key={platformKey}
                    variant="outline"
                    className="h-auto p-4 flex flex-col items-center gap-3 hover:bg-white/10"
                  >
                    <div className={`w-12 h-12 rounded-xl ${platform.bgColor} flex items-center justify-center`}>
                      <Icon className={`w-6 h-6 ${platform.color}`} />
                    </div>
                    <span className="text-white font-medium">{platform.name}</span>
                  </Button>
                );
              })}
            </div>
            
            <div className="mt-6 p-4 bg-neon-blue/10 rounded-xl border border-neon-blue/20">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-neon-blue" />
                <h4 className="font-semibold text-white">Upgrade to Pica AI</h4>
              </div>
              <p className="text-sm text-white/70 mb-3">
                Connect unlimited accounts and automate posting with natural language commands like "Post this to Instagram and LinkedIn at 5 PM"
              </p>
              <Button
                onClick={() => setShowPicaIntegration(true)}
                size="sm"
                className="bg-neon-gradient"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Try Pica Integration
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};