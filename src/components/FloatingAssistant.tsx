import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAtom } from 'jotai';
import { MessageCircle, X, Sparkles, Video, Maximize2, Minimize2 } from 'lucide-react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TavusAPI } from '../lib/tavus';
import { tavusConversationAtom, isCreatingConversationAtom } from '../store/tavus';
import { ElevenLabsTranscriptionPanel } from './ElevenLabsTranscriptionPanel';

const TAVUS_API_KEY = '2f263fcb5fa44c7ca8ed76d789cdb756';
const TAVUS_REPLICA_ID = 'r9fa0878977a';

export const FloatingAssistant: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [conversation, setConversation] = useAtom(tavusConversationAtom);
  const [isCreating, setIsCreating] = useAtom(isCreatingConversationAtom);
  const [showTranscription, setShowTranscription] = useState(false);

  const startTavusConversation = async () => {
    setIsCreating(true);
    try {
      const tavus = new TavusAPI(TAVUS_API_KEY);
      const newConversation = await tavus.createConversation({
        replica_id: TAVUS_REPLICA_ID,
        custom_greeting: 'Hi! I\'m your AI creator assistant. I can help you with post analysis through video conversation, writing scripts for your niche, and sharing the latest trends in your field.',
        conversational_context: 'You are an AI assistant specialized in helping content creators with post analysis, script writing for their specific niche, and providing trending insights in their field.',
      });
      
      setConversation(newConversation);
      setShowTranscription(true);
    } catch (error) {
      console.error('Failed to create Tavus conversation:', error);
    } finally {
      setIsCreating(false);
    }
  };

  const endTavusConversation = async () => {
    if (conversation) {
      try {
        const tavus = new TavusAPI(TAVUS_API_KEY);
        await tavus.endConversation(conversation.conversation_id);
        setConversation(null);
        setShowTranscription(false);
      } catch (error) {
        console.error('Failed to end Tavus conversation:', error);
      }
    }
  };

  return (
    <>
      {/* Floating Button */}
      <motion.div
        className="fixed bottom-6 right-6 z-50"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-16 h-16 rounded-full bg-glass backdrop-blur-md border border-white/20 shadow-2xl animate-float"
          style={{
            background: 'linear-gradient(135deg, rgba(0, 212, 255, 0.3), rgba(139, 92, 246, 0.3))',
            boxShadow: '0 0 30px rgba(0, 212, 255, 0.5)',
          }}
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div
                key="close"
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ rotate: 90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: -90, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <MessageCircle className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      </motion.div>

      {/* Expanded Interface */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className={`fixed bottom-24 right-6 z-40 ${
              isExpanded ? 'w-[1200px] h-[700px]' : 'w-96 h-[500px]'
            } transition-all duration-300`}
          >
            <Card className="h-full flex flex-col">
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neon-gradient flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">AI Assistant</h3>
                      <p className="text-xs text-white/60">Tavus Powered</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsExpanded(!isExpanded)}
                      className="text-white/60 hover:text-white"
                    >
                      {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                    </Button>
                    {conversation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={endTavusConversation}
                        className="text-red-400 hover:text-red-300"
                      >
                        End Call
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-hidden">
                {conversation ? (
                  <div className={`h-full ${isExpanded ? 'flex gap-4 p-4' : ''}`}>
                    <div className={`${isExpanded ? 'flex-1' : 'h-full'}`}>
                      <iframe
                        src={conversation.conversation_url}
                        allow="camera; microphone; fullscreen; display-capture"
                        className="w-full h-full rounded-lg border-0"
                      />
                    </div>
                    
                    {/* ElevenLabs Transcription Panel - Only show when expanded and conversation is active */}
                    {isExpanded && showTranscription && (
                      <div className="w-96 h-full">
                        <ElevenLabsTranscriptionPanel 
                          autoStart={true}
                          showSettings={true}
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-4 space-y-4">
                    <div className="bg-white/10 p-4 rounded-xl border border-white/20">
                      <div className="flex items-center gap-3 mb-3">
                        <img 
                          src="https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=400" 
                          alt="AI Assistant" 
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <h4 className="font-semibold text-white">Video AI Assistant</h4>
                          <p className="text-xs text-white/60">Powered by Tavus</p>
                        </div>
                      </div>
                      <p className="text-sm text-white mb-3">
                        Start a video conversation for:
                      </p>
                      <ul className="text-xs text-white/80 space-y-2">
                        <li className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-neon-blue" />
                          Post analysis through video conversation
                        </li>
                        <li className="flex items-center gap-2">
                          <MessageCircle className="w-4 h-4 text-neon-purple" />
                          Writing scripts according to your niche
                        </li>
                        <li className="flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-neon-pink" />
                          Latest trends in your field
                        </li>
                      </ul>
                    </div>
                    
                    <Button
                      onClick={startTavusConversation}
                      disabled={isCreating}
                      className="w-full"
                    >
                      <Video className="w-4 h-4 mr-2" />
                      {isCreating ? 'Starting...' : 'Start Video Chat'}
                    </Button>

                    <div className="text-center text-xs text-white/60 space-y-1">
                      <p>Tip: Expand the chat window to see live transcription</p>
                      <p>Real-time speech-to-text powered by ElevenLabs AI</p>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};