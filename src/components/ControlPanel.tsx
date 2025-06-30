import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Play, Calendar, FileText, ToggleLeft, ToggleRight } from 'lucide-react';

export const ControlPanel: React.FC = () => {
  const [automations, setAutomations] = useState({
    autoPitch: false,
    schedulePosts: true,
    writeBio: false,
  });

  const toggleAutomation = (key: keyof typeof automations) => {
    setAutomations(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Transcription Output */}
      <Card className="flex-1">
        <CardHeader>
          <CardTitle className="text-lg">AI Planning Output</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-white/80">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="p-3 bg-white/5 rounded-xl border-l-4 border-neon-blue"
            >
              <p className="font-medium text-neon-blue mb-1">Step 1: Brand Analysis</p>
              <p>Analyzing uploaded brand brief and target audience...</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="p-3 bg-white/5 rounded-xl border-l-4 border-neon-purple"
            >
              <p className="font-medium text-neon-purple mb-1">Step 2: Content Strategy</p>
              <p>Creating personalized video script based on your brand voice...</p>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.5 }}
              className="p-3 bg-white/5 rounded-xl border-l-4 border-neon-pink"
            >
              <p className="font-medium text-neon-pink mb-1">Step 3: Video Generation</p>
              <p>Generating AI avatar video with Tavus technology...</p>
            </motion.div>
          </div>
        </CardContent>
      </Card>

      {/* Automation Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Automation Controls</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { key: 'autoPitch', label: 'Auto Pitch', icon: Play },
              { key: 'schedulePosts', label: 'Schedule Posts', icon: Calendar },
              { key: 'writeBio', label: 'Write Bio', icon: FileText },
            ].map(({ key, label, icon: Icon }) => (
              <div key={key} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5 text-white/60" />
                  <span className="text-white">{label}</span>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleAutomation(key as keyof typeof automations)}
                  className="p-0 h-auto"
                >
                  {automations[key as keyof typeof automations] ? (
                    <ToggleRight className="w-8 h-8 text-neon-blue" />
                  ) : (
                    <ToggleLeft className="w-8 h-8 text-white/40" />
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Video Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">AI Avatar Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="aspect-video bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 rounded-xl border border-white/20 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-neon-gradient rounded-full mx-auto mb-4 flex items-center justify-center animate-pulse">
                <Play className="w-8 h-8 text-white" />
              </div>
              <p className="text-white/60 text-sm">AI Avatar Video</p>
              <p className="text-white/40 text-xs">Powered by Tavus</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};