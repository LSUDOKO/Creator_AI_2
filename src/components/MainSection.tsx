import React from 'react';
import { motion } from 'framer-motion';
import { ChatInterface } from './ChatInterface';
import { ControlPanel } from './ControlPanel';

export const MainSection: React.FC = () => {
  return (
    <section className="min-h-screen px-6 py-12">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent mb-4 font-jakarta">
            Create. Automate. Scale.
          </h2>
          <p className="text-xl text-white/70 max-w-2xl mx-auto font-inter">
            Your AI-powered content creation studio
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-8 h-[800px]">
          {/* Left Panel - Chat Interface */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
            className="h-full"
          >
            <ChatInterface />
          </motion.div>

          {/* Right Panel - Control Panel */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }}
            className="h-full"
          >
            <ControlPanel />
          </motion.div>
        </div>
      </div>
    </section>
  );
};