import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { AuthKitButton } from '../AuthKitButton';
import { 
  CheckCircle,
  AlertCircle,
  ExternalLink,
  Zap,
  Settings,
  Trash2,
  RefreshCw
} from 'lucide-react';

interface Connection {
  id: string;
  platform: string;
  username?: string;
  isConnected: boolean;
  connectedAt?: Date;
  status: 'active' | 'error' | 'expired';
}

export const AuthKitSocialConnector: React.FC = () => {
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: '1',
      platform: 'Instagram',
      username: '@creator_pilot',
      isConnected: true,
      connectedAt: new Date(),
      status: 'active',
    },
    {
      id: '2',
      platform: 'YouTube',
      username: 'CreatorPilot Channel',
      isConnected: true,
      connectedAt: new Date(),
      status: 'active',
    },
  ]);

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [notifications, setNotifications] = useState<Array<{
    id: string;
    type: 'success' | 'error';
    message: string;
  }>>([]);

  const handleConnectionSuccess = (connection: any) => {
    console.log('New connection:', connection);
    
    // Add new connection to the list
    const newConnection: Connection = {
      id: connection.id || Date.now().toString(),
      platform: connection.platform || 'Unknown',
      username: connection.username,
      isConnected: true,
      connectedAt: new Date(),
      status: 'active',
    };

    setConnections(prev => [...prev, newConnection]);
    
    // Show success notification
    addNotification('success', `Successfully connected ${newConnection.platform}!`);
  };

  const handleConnectionError = (error: any) => {
    console.error('Connection error:', error);
    addNotification('error', 'Failed to connect account. Please try again.');
  };

  const addNotification = (type: 'success' | 'error', message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, 5000);
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const disconnectAccount = (connectionId: string) => {
    setConnections(prev => prev.filter(c => c.id !== connectionId));
    addNotification('success', 'Account disconnected successfully');
  };

  const refreshConnections = async () => {
    setIsRefreshing(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update connection statuses
    setConnections(prev => prev.map(conn => ({
      ...conn,
      status: Math.random() > 0.1 ? 'active' : 'error'
    })));
    
    setIsRefreshing(false);
    addNotification('success', 'Connections refreshed');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'error': return 'text-red-400';
      case 'expired': return 'text-yellow-400';
      default: return 'text-white/60';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return CheckCircle;
      case 'error': return AlertCircle;
      case 'expired': return AlertCircle;
      default: return CheckCircle;
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications */}
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className={`fixed top-4 right-4 z-50 p-4 rounded-lg border ${
              notification.type === 'success'
                ? 'bg-green-500/10 border-green-500/20 text-green-400'
                : 'bg-red-500/10 border-red-500/20 text-red-400'
            }`}
          >
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm">{notification.message}</span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => removeNotification(notification.id)}
                className="p-1 h-auto"
              >
                ×
              </Button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <Card className="border-neon-purple/30 bg-gradient-to-r from-neon-purple/10 to-neon-blue/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-neon-gradient flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">AuthKit Integration</h3>
                <p className="text-sm text-white/70">
                  Secure social media connections powered by Pica AuthKit
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={refreshConnections}
                disabled={isRefreshing}
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
              <AuthKitButton
                onSuccess={handleConnectionSuccess}
                onError={handleConnectionError}
                className="bg-neon-gradient"
              >
                <Zap className="w-4 h-4 mr-2" />
                Connect New Account
              </AuthKitButton>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-400" />
              Connected Accounts
              <Badge variant="secondary">{connections.length}</Badge>
            </CardTitle>
          </div>
        </CardHeader>

        <CardContent>
          {connections.length > 0 ? (
            <div className="space-y-4">
              {connections.map((connection) => {
                const StatusIcon = getStatusIcon(connection.status);
                
                return (
                  <motion.div
                    key={connection.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center">
                        <StatusIcon className={`w-6 h-6 ${getStatusColor(connection.status)}`} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white">{connection.platform}</h3>
                        {connection.username && (
                          <p className="text-sm text-white/60">{connection.username}</p>
                        )}
                        <p className="text-xs text-white/40">
                          Connected {connection.connectedAt?.toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge 
                        variant="secondary" 
                        className={`${getStatusColor(connection.status)} border-current`}
                      >
                        {connection.status}
                      </Badge>
                      
                      <div className="flex items-center gap-2">
                        <Button variant="ghost" size="sm">
                          <Settings className="w-4 h-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="w-4 h-4" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => disconnectAccount(connection.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center mx-auto mb-4">
                <Zap className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Accounts Connected</h3>
              <p className="text-white/60 mb-6">
                Connect your social media accounts to start automating your content posting
              </p>
              <AuthKitButton
                onSuccess={handleConnectionSuccess}
                onError={handleConnectionError}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Features Overview */}
      <Card>
        <CardHeader>
          <CardTitle>AuthKit Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <h4 className="font-semibold text-white">🔐 Secure Authentication</h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• OAuth 2.0 compliant connections</li>
                <li>• Encrypted token storage</li>
                <li>• Automatic token refresh</li>
                <li>• Secure credential management</li>
              </ul>
            </div>
            <div className="space-y-3">
              <h4 className="font-semibold text-white">🚀 Platform Support</h4>
              <ul className="text-sm text-white/70 space-y-1">
                <li>• Instagram, YouTube, Twitter/X</li>
                <li>• LinkedIn, Facebook, TikTok</li>
                <li>• Slack, Discord, Telegram</li>
                <li>• 100+ integrations available</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};