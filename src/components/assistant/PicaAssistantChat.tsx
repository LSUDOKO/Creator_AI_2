import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Send, Zap, Calendar, Share2, Sparkles } from 'lucide-react';
import { usePicaIntegration } from '../../hooks/usePicaIntegration';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type?: 'text' | 'action' | 'result';
  action?: {
    type: 'post' | 'schedule';
    platforms: string[];
    content: string;
    scheduleTime?: Date;
  };
}

export const PicaAssistantChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hi! I'm your Pica AI assistant. I can help you post content across all your connected social media platforms using natural language. Try saying something like 'Post this video to Instagram and YouTube' or 'Schedule a LinkedIn post for tomorrow at 10 AM'.",
      sender: 'ai',
      timestamp: new Date(),
      type: 'text',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const { postWithAgent, connectedAccounts } = usePicaIntegration();

  const handleSendMessage = async () => {
    if (!inputText.trim() || isProcessing) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
      type: 'text',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsProcessing(true);

    try {
      // Check if this looks like a posting command
      const postingKeywords = ['post', 'share', 'publish', 'schedule', 'upload'];
      const isPostingCommand = postingKeywords.some(keyword => 
        inputText.toLowerCase().includes(keyword)
      );

      if (isPostingCommand && connectedAccounts.length > 0) {
        // Use Pica agent to process the command
        const results = await postWithAgent({
          prompt: inputText,
          contentType: 'text',
        });

        // Add AI response with results
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: `I've processed your request! Here's what happened:`,
          sender: 'ai',
          timestamp: new Date(),
          type: 'result',
        };

        setMessages(prev => [...prev, aiResponse]);

        // Add result details
        results.forEach((result, index) => {
          const resultMessage: Message = {
            id: (Date.now() + 2 + index).toString(),
            text: result.success 
              ? `✅ Successfully posted to ${result.platform}${result.scheduledFor ? ` (scheduled for ${new Date(result.scheduledFor).toLocaleString()})` : ''}`
              : `❌ Failed to post to ${result.platform}: ${result.error}`,
            sender: 'ai',
            timestamp: new Date(),
            type: 'result',
          };
          setMessages(prev => [...prev, resultMessage]);
        });

      } else if (isPostingCommand && connectedAccounts.length === 0) {
        // No connected accounts
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: "I'd love to help you post content, but you don't have any social media accounts connected yet. Please connect your accounts first in the Social Media section of your dashboard.",
          sender: 'ai',
          timestamp: new Date(),
          type: 'text',
        };
        setMessages(prev => [...prev, aiResponse]);

      } else {
        // General conversation
        const responses = [
          "I can help you with social media posting! Try commands like 'Post this to Instagram' or 'Schedule for LinkedIn tomorrow'.",
          "What would you like to post? I can help you share content across all your connected platforms.",
          "I'm here to help with your social media automation. What can I do for you today?",
          "Need help with posting? I can understand natural language commands and post to multiple platforms at once.",
        ];
        
        const aiResponse: Message = {
          id: (Date.now() + 1).toString(),
          text: responses[Math.floor(Math.random() * responses.length)],
          sender: 'ai',
          timestamp: new Date(),
          type: 'text',
        };
        setMessages(prev => [...prev, aiResponse]);
      }

    } catch (error) {
      console.error('Error processing message:', error);
      const errorResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "Sorry, I encountered an error processing your request. Please try again.",
        sender: 'ai',
        timestamp: new Date(),
        type: 'text',
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsProcessing(false);
    }
  };

  const quickActions = [
    {
      text: "Post to Instagram and Facebook",
      icon: Share2,
    },
    {
      text: "Schedule for LinkedIn tomorrow at 10 AM",
      icon: Calendar,
    },
    {
      text: "Share on all platforms with trending hashtags",
      icon: Sparkles,
    },
  ];

  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-neon-gradient flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">Pica AI Assistant</h3>
            <p className="text-sm text-white/60">Social Media Automation</p>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] p-4 rounded-2xl ${
                  message.sender === 'user'
                    ? 'bg-neon-gradient text-white'
                    : message.type === 'result'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-white/10 text-white border border-white/20'
                }`}
              >
                <p className="text-sm">{message.text}</p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString()}
                </span>
              </div>
            </motion.div>
          ))}

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex justify-start"
            >
              <div className="bg-white/10 text-white border border-white/20 p-4 rounded-2xl">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse"></div>
                  <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                  <div className="w-2 h-2 bg-neon-blue rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                  <span className="text-sm ml-2">Processing...</span>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3 mb-4">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Try: 'Post this video to Instagram and YouTube at 5 PM'"
              className="flex-1 bg-white/10 border-white/20 text-white placeholder-white/50"
              disabled={isProcessing}
            />
            <Button 
              onClick={handleSendMessage} 
              size="icon"
              disabled={!inputText.trim() || isProcessing}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
          
          <div className="space-y-2">
            <p className="text-xs text-white/60">Quick actions:</p>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => setInputText(action.text)}
                  className="text-xs"
                  disabled={isProcessing}
                >
                  <action.icon className="w-3 h-3 mr-1" />
                  {action.text}
                </Button>
              ))}
            </div>
          </div>

          {connectedAccounts.length === 0 && (
            <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <p className="text-xs text-yellow-400">
                💡 Connect your social media accounts to start posting with AI commands
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};