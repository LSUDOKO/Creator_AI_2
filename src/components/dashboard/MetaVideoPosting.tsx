import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  Video, 
  Loader2, 
  CheckCircle, 
  AlertCircle, 
  ExternalLink,
  Plus,
  Settings,
  Facebook,
  Instagram,
  Share2,
  Info
} from 'lucide-react';
import { useAtom } from 'jotai';
import { userAtom } from '../../store/auth';
import { MetaAPI, MetaPostRequest, MetaAccount } from '../../lib/meta';

export const MetaVideoPosting: React.FC = () => {
  const [user] = useAtom(userAtom);
  const [connectedAccounts, setConnectedAccounts] = useState<MetaAccount[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [objectStoryId, setObjectStoryId] = useState('');
  const [pageId, setPageId] = useState('');
  const [creativeName, setCreativeName] = useState('');
  
  // Account connection state
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [newAccountId, setNewAccountId] = useState('');
  const [newAccountName, setNewAccountName] = useState('');
  const [newPageId, setNewPageId] = useState('');

  // Load connected accounts on mount
  useEffect(() => {
    if (user?.id) {
      loadConnectedAccounts();
    }
  }, [user?.id]);

  const loadConnectedAccounts = async () => {
    if (!user?.id) return;
    
    try {
      setIsLoading(true);
      const accounts = await MetaAPI.getConnectedAccounts(user.id);
      setConnectedAccounts(accounts);
    } catch (err) {
      console.error('Failed to load Meta accounts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddAccount = async () => {
    if (!user?.id || !newAccountId.trim() || !newAccountName.trim()) {
      setError('Please fill in all required fields');
      return;
    }

    if (!MetaAPI.validateAccountId(newAccountId)) {
      setError('Invalid account ID format. Use format: act_1234567890');
      return;
    }

    if (newPageId && !MetaAPI.validatePageId(newPageId)) {
      setError('Invalid page ID format. Page ID should be numeric.');
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      const newAccount = await MetaAPI.connectAccount(user.id, {
        account_id: newAccountId,
        name: newAccountName,
        page_id: newPageId || undefined,
      });

      setConnectedAccounts(prev => [...prev, newAccount]);
      setShowAddAccount(false);
      setNewAccountId('');
      setNewAccountName('');
      setNewPageId('');
      setSuccess('Meta account connected successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to connect Meta account');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePostToMeta = async () => {
    if (!selectedAccount || !objectStoryId.trim()) {
      setError('Please select an account and enter an object story ID');
      return;
    }

    if (!MetaAPI.validateObjectStoryId(objectStoryId)) {
      setError('Invalid object story ID format. Should be numeric.');
      return;
    }

    const account = connectedAccounts.find(acc => acc.id === selectedAccount);
    if (!account) {
      setError('Selected account not found');
      return;
    }

    try {
      setIsPosting(true);
      setError(null);
      setSuccess(null);

      const request: MetaPostRequest = {
        account_id: account.account_id,
        object_story_id: objectStoryId,
        name: creativeName || 'CreatorPilot Video Creative',
        ...(pageId && { page_id: pageId }),
      };

      const result = await MetaAPI.postVideoToMeta(request);

      if (result.success) {
        setSuccess(`Video posted to Meta successfully! Creative ID: ${result.creative_id}`);
        setObjectStoryId('');
        setCreativeName('');
        setPageId('');
      } else {
        setError(result.error || 'Failed to post to Meta');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to post to Meta');
    } finally {
      setIsPosting(false);
    }
  };

  const handleDisconnectAccount = async (accountId: string) => {
    if (!user?.id) return;

    try {
      await MetaAPI.disconnectAccount(user.id, accountId);
      setConnectedAccounts(prev => prev.filter(acc => acc.id !== accountId));
      setSuccess('Account disconnected successfully');
    } catch (err: any) {
      setError(err.message || 'Failed to disconnect account');
    }
  };

  const requirements = MetaAPI.getPostingRequirements();

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="border-blue-500/30 bg-gradient-to-r from-blue-500/10 to-purple-500/10">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center">
                <Facebook className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Meta Video Posting</h3>
                <p className="text-sm text-white/70">
                  Post your AI-generated videos to Facebook and Instagram
                </p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-blue-500/20 text-blue-400">
              Powered by Pica
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Error/Success Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span className="text-red-400 text-sm">{error}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setError(null)}
              className="ml-auto p-1 h-auto text-red-400"
            >
              ×
            </Button>
          </motion.div>
        )}

        {success && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center gap-2"
          >
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm">{success}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSuccess(null)}
              className="ml-auto p-1 h-auto text-green-400"
            >
              ×
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Connected Accounts */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              <Settings className="w-5 h-5 text-blue-400" />
              Connected Meta Accounts
              <Badge variant="secondary">{connectedAccounts.length}</Badge>
            </CardTitle>
            <Button
              onClick={() => setShowAddAccount(true)}
              size="sm"
              className="bg-blue-500 hover:bg-blue-600"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Account
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {connectedAccounts.length > 0 ? (
            <div className="space-y-3">
              {connectedAccounts.map((account) => (
                <div
                  key={account.id}
                  className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10"
                >
                  <div className="flex items-center gap-3">
                    <Facebook className="w-5 h-5 text-blue-400" />
                    <div>
                      <h3 className="font-medium text-white">{account.name}</h3>
                      <p className="text-sm text-white/60">
                        {MetaAPI.formatAccountId(account.account_id)}
                      </p>
                      {account.page_id && (
                        <p className="text-xs text-white/50">Page: {account.page_id}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-green-400 border-green-400">
                      Connected
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDisconnectAccount(account.id)}
                      className="text-red-400 hover:text-red-300"
                    >
                      Disconnect
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Facebook className="w-12 h-12 text-white/40 mx-auto mb-4" />
              <h3 className="font-medium text-white mb-2">No Meta Accounts Connected</h3>
              <p className="text-white/60 mb-4">
                Connect your Meta Ad Account to start posting videos
              </p>
              <Button onClick={() => setShowAddAccount(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Connect Meta Account
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Account Form */}
      <AnimatePresence>
        {showAddAccount && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Add Meta Account
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowAddAccount(false)}
                  >
                    ×
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="account-name">Account Name</Label>
                  <Input
                    id="account-name"
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    placeholder="My Meta Account"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="account-id">Meta Ad Account ID</Label>
                  <Input
                    id="account-id"
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                    placeholder="act_1234567890"
                  />
                  <p className="text-xs text-white/60">
                    Format: act_1234567890 (find this in Meta Ads Manager)
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="page-id">Facebook Page ID (Optional)</Label>
                  <Input
                    id="page-id"
                    value={newPageId}
                    onChange={(e) => setNewPageId(e.target.value)}
                    placeholder="1234567890"
                  />
                  <p className="text-xs text-white/60">
                    Numeric ID of your Facebook Page
                  </p>
                </div>

                <div className="flex gap-2">
                  <Button
                    onClick={handleAddAccount}
                    disabled={isLoading}
                    className="flex-1"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Plus className="w-4 h-4 mr-2" />
                    )}
                    Connect Account
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddAccount(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Posting Form */}
      {connectedAccounts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-3">
              <Video className="w-5 h-5 text-purple-400" />
              Post Video to Meta
            </CardTitle>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="account-select">Select Meta Account</Label>
              <select
                id="account-select"
                value={selectedAccount}
                onChange={(e) => setSelectedAccount(e.target.value)}
                className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white"
              >
                <option value="">Choose an account...</option>
                {connectedAccounts.map((account) => (
                  <option key={account.id} value={account.id} className="bg-gray-800">
                    {account.name} ({MetaAPI.formatAccountId(account.account_id)})
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="object-story-id">Object Story ID</Label>
              <Input
                id="object-story-id"
                value={objectStoryId}
                onChange={(e) => setObjectStoryId(e.target.value)}
                placeholder="1234567890123456"
              />
              <p className="text-xs text-white/60">
                The ID of your video post on Facebook/Instagram
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="creative-name">Creative Name (Optional)</Label>
              <Input
                id="creative-name"
                value={creativeName}
                onChange={(e) => setCreativeName(e.target.value)}
                placeholder="My AI Video Creative"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-id-override">Page ID Override (Optional)</Label>
              <Input
                id="page-id-override"
                value={pageId}
                onChange={(e) => setPageId(e.target.value)}
                placeholder="1234567890"
              />
              <p className="text-xs text-white/60">
                Override the default page ID for this post
              </p>
            </div>

            <Button
              onClick={handlePostToMeta}
              disabled={isPosting || !selectedAccount || !objectStoryId}
              className="w-full"
            >
              {isPosting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Posting to Meta...
                </>
              ) : (
                <>
                  <Share2 className="w-4 h-4 mr-2" />
                  Post to Meta
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Requirements and Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <Info className="w-5 h-5 text-yellow-400" />
            Requirements & Tips
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-white mb-3">Requirements</h4>
              <ul className="space-y-2">
                {requirements.requirements.map((req, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                    <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                    {req}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-3">Tips for Success</h4>
              <ul className="space-y-2">
                {requirements.tips.map((tip, index) => (
                  <li key={index} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0">💡</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
            <div className="flex items-start gap-3">
              <ExternalLink className="w-5 h-5 text-blue-400 mt-0.5" />
              <div>
                <h4 className="font-semibold text-white mb-1">Need Help?</h4>
                <p className="text-sm text-white/70 mb-2">
                  Find your Meta Ad Account ID and Page ID in Meta Ads Manager.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open('https://business.facebook.com/adsmanager', '_blank')}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Open Meta Ads Manager
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};