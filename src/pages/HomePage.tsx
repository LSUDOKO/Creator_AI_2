import React from 'react';
import { motion } from 'framer-motion';
import { useAtom } from 'jotai';
import { currentPageAtom } from '../store/navigation';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Video, Calendar, MessageSquare, TrendingUp, Zap, Play } from 'lucide-react';

export const HomePage: React.FC = () => {
  const [, setCurrentPage] = useAtom(currentPageAtom);

  const features = [
    {
      icon: Video,
      title: 'AI Avatar Videos',
      description: 'Generate personalized videos with realistic AI avatars powered by Tavus',
    },
    {
      icon: MessageSquare,
      title: 'Auto Captions',
      description: 'AI-generated captions, titles, and hashtags for all your content',
    },
    {
      icon: Calendar,
      title: 'Smart Scheduling',
      description: 'Auto-schedule posts based on your audience analytics',
    },
    {
      icon: TrendingUp,
      title: 'Competitor Analysis',
      description: 'Track competitors and get insights on viral content',
    },
    {
      icon: Zap,
      title: 'Audience Insights',
      description: 'AI-powered sentiment analysis of your comments and feedback',
    },
  ];

  return (
    <div className="pt-20">
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="mb-8"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass backdrop-blur-md border border-white/20 text-sm text-white/80 mb-6">
              <div className="w-2 h-2 bg-neon-blue rounded-full"></div>
              AI Assistant for Creators
            </div>
            
            <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-neon-blue to-neon-purple bg-clip-text text-transparent mb-6 font-jakarta">
              Your AI Creator,
              <br />
              Always On
            </h1>
            
            <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed font-inter mb-8">
              Generate personalized videos, brand pitches, and marketing content — just by chatting with your AI twin.
            </p>

            <Button 
              size="lg" 
              className="text-lg px-12 py-6 h-auto animate-glow mr-4"
              onClick={() => setCurrentPage('content-creation')}
            >
              Try Free
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Video Demo Section */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-4xl font-bold text-white mb-4 font-jakarta">
              See It In Action
            </h2>
            <p className="text-xl text-white/70">
              Watch how CreatorPilot transforms your content creation workflow
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="relative aspect-video bg-black border border-white/20 overflow-hidden rounded-2xl">
              <iframe
                src="https://tavus.video/8f3ab19532"
                className="w-full h-full"
                allow="autoplay; fullscreen; picture-in-picture"
                allowFullScreen
                title="AI Avatar Demo"
              />
              
              {/* Overlay with title and branding */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-white mb-1">AI Avatar Demo</h3>
                    <p className="text-white/70 text-sm">Powered by Tavus Technology</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Play className="w-5 h-5 text-neon-blue" />
                    <span className="text-neon-blue text-sm font-medium">Watch Demo</span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 font-jakarta">
              Everything You Need
            </h2>
            <p className="text-xl text-white/70 max-w-2xl mx-auto">
              Powerful AI tools designed specifically for content creators
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Card className="p-6 h-full hover:bg-white/5 transition-colors">
                  <feature.icon className="w-12 h-12 text-neon-blue mb-4" />
                  <h3 className="text-xl font-semibold text-white mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-white/70">
                    {feature.description}
                  </p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};