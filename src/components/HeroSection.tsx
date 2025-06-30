import React from 'react';
import { motion } from 'framer-motion';
import { Button } from './ui/button';
import { Sparkles } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center px-6">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glass backdrop-blur-md border border-white/20 text-sm text-white/80 mb-6">
            <Sparkles className="w-4 h-4 text-neon-blue" />
            AI-Powered Content Creation
          </div>
          
          <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-neon-blue to-neon-purple bg-clip-text text-transparent mb-6 font-jakarta">
            Your AI Creator,
            <br />
            Always On
          </h1>
          
          <p className="text-xl md:text-2xl text-white/70 max-w-2xl mx-auto leading-relaxed font-inter">
            Generate personalized videos, brand pitches, and marketing content — just by chatting with your AI twin.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
        >
          <Button size="lg" className="text-lg px-12 py-6 h-auto animate-glow">
            Start Creating
          </Button>
        </motion.div>
      </div>
    </section>
  );
};