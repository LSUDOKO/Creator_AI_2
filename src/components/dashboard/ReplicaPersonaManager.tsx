import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { 
  User, 
  Sparkles, 
  Plus, 
  Upload, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Edit,
  Trash2,
  Play
} from 'lucide-react';
import { TavusAPI, TavusReplica, TavusPersona } from '../../lib/tavus';

const TAVUS_API_KEY = '2f263fcb5fa44c7ca8ed76d789cdb756';

export const ReplicaPersonaManager: React.FC = () => {
  const [replicas, setReplicas] = useState<TavusReplica[]>([]);
  const [personas, setPersonas] = useState<TavusPersona[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'replicas' | 'personas'>('replicas');
  
  // Replica creation state
  const [showCreateReplica, setShowCreateReplica] = useState(false);
  const [replicaName, setReplicaName] = useState('');
  const [trainingVideo, setTrainingVideo] = useState<File | null>(null);
  const [isCreatingReplica, setIsCreatingReplica] = useState(false);
  
  // Persona creation state
  const [showCreatePersona, setShowCreatePersona] = useState(false);
  const [personaName, setPersonaName] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [personaContext, setPersonaContext] = useState('');
  const [isCreatingPersona, setIsCreatingPersona] = useState(false);

  const tavus = new TavusAPI(TAVUS_API_KEY);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [replicasData, personasData] = await Promise.all([
        tavus.getReplicas(),
        tavus.getPersonas(),
      ]);
      setReplicas(replicasData);
      setPersonas(personasData);
    } catch (error) {
      console.error('Failed to load data:', error);
      // Use mock data for demo
      setReplicas([
        {
          replica_id: 'r9fa0878977a',
          replica_name: 'Professional Sarah',
          thumbnail_image_url: 'https://images.pexels.com/photos/3861969/pexels-photo-3861969.jpeg?auto=compress&cs=tinysrgb&w=200',
          status: 'ready',
          voice_id: 'voice_001',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          replica_id: 'rb17cf590e15',
          replica_name: 'Creative Alex',
          thumbnail_image_url: 'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=200',
          status: 'ready',
          voice_id: 'voice_002',
          created_at: '2024-01-16T14:30:00Z',
        },
      ]);
      setPersonas([
        {
          persona_id: 'pd43ffef',
          persona_name: 'Marketing Expert',
          system_prompt: 'You are a marketing expert who creates engaging content for social media.',
          context: 'Focus on conversion-driven messaging and audience engagement.',
          created_at: '2024-01-15T10:00:00Z',
        },
        {
          persona_id: 'pe54ggfg',
          persona_name: 'Tech Educator',
          system_prompt: 'You are a technology educator who explains complex concepts simply.',
          context: 'Break down technical topics into easy-to-understand explanations.',
          created_at: '2024-01-16T11:00:00Z',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReplica = async () => {
    if (!replicaName.trim() || !trainingVideo) return;

    try {
      setIsCreatingReplica(true);
      
      // In a real implementation, you'd upload the video file first
      const uploadedVideoUrl = 'https://example.com/training-video.mp4';
      
      const newReplica = await tavus.createReplica({
        replica_name: replicaName,
        train_video_url: uploadedVideoUrl,
      });

      setReplicas(prev => [newReplica, ...prev]);
      setReplicaName('');
      setTrainingVideo(null);
      setShowCreateReplica(false);
    } catch (error) {
      console.error('Failed to create replica:', error);
    } finally {
      setIsCreatingReplica(false);
    }
  };

  const handleCreatePersona = async () => {
    if (!personaName.trim() || !systemPrompt.trim()) return;

    try {
      setIsCreatingPersona(true);
      
      const newPersona = await tavus.createPersona({
        persona_name: personaName,
        system_prompt: systemPrompt,
        context: personaContext,
      });

      setPersonas(prev => [newPersona, ...prev]);
      setPersonaName('');
      setSystemPrompt('');
      setPersonaContext('');
      setShowCreatePersona(false);
    } catch (error) {
      console.error('Failed to create persona:', error);
    } finally {
      setIsCreatingPersona(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'training': return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready': return 'text-green-400';
      case 'training': return 'text-yellow-400';
      case 'failed': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-neon-blue" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>AI Assets Manager</CardTitle>
            <div className="flex gap-2">
              <Button
                variant={activeTab === 'replicas' ? 'default' : 'outline'}
                onClick={() => setActiveTab('replicas')}
                size="sm"
              >
                <User className="w-4 h-4 mr-2" />
                Replicas ({replicas.length})
              </Button>
              <Button
                variant={activeTab === 'personas' ? 'default' : 'outline'}
                onClick={() => setActiveTab('personas')}
                size="sm"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Personas ({personas.length})
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Replicas Tab */}
      {activeTab === 'replicas' && (
        <div className="space-y-6">
          {/* Create Replica Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">AI Replicas</h2>
            <Button onClick={() => setShowCreateReplica(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Replica
            </Button>
          </div>

          {/* Create Replica Form */}
          <AnimatePresence>
            {showCreateReplica && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Create New Replica
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCreateReplica(false)}
                      >
                        ×
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="replica-name">Replica Name</Label>
                      <Input
                        id="replica-name"
                        value={replicaName}
                        onChange={(e) => setReplicaName(e.target.value)}
                        placeholder="e.g., Professional Sarah"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="training-video">Training Video</Label>
                      <div className="flex items-center gap-2">
                        <input
                          type="file"
                          accept="video/*"
                          onChange={(e) => setTrainingVideo(e.target.files?.[0] || null)}
                          className="hidden"
                          id="training-video-upload"
                        />
                        <label
                          htmlFor="training-video-upload"
                          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white text-sm cursor-pointer hover:bg-white/20 transition-colors flex items-center gap-2"
                        >
                          <Upload className="w-4 h-4" />
                          {trainingVideo ? trainingVideo.name : 'Choose training video'}
                        </label>
                      </div>
                      <p className="text-xs text-white/60">
                        💡 Upload a 2-5 minute video of yourself speaking clearly to camera
                      </p>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreateReplica}
                        disabled={!replicaName.trim() || !trainingVideo || isCreatingReplica}
                        className="flex-1"
                      >
                        {isCreatingReplica ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <User className="w-4 h-4 mr-2" />
                            Create Replica
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreateReplica(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Replicas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {replicas.map((replica) => (
              <motion.div
                key={replica.replica_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-20 h-20 rounded-full overflow-hidden mb-4">
                        <img
                          src={replica.thumbnail_image_url}
                          alt={replica.replica_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      
                      <h3 className="font-semibold text-white mb-2">
                        {replica.replica_name}
                      </h3>
                      
                      <div className="flex items-center gap-2 mb-4">
                        {getStatusIcon(replica.status)}
                        <span className={`text-sm ${getStatusColor(replica.status)}`}>
                          {replica.status.charAt(0).toUpperCase() + replica.status.slice(1)}
                        </span>
                      </div>

                      <p className="text-xs text-white/60 mb-4">
                        Created: {new Date(replica.created_at).toLocaleDateString()}
                      </p>

                      <div className="flex gap-2 w-full">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="w-3 h-3 mr-1" />
                          Edit
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                          <Play className="w-3 h-3 mr-1" />
                          Test
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Personas Tab */}
      {activeTab === 'personas' && (
        <div className="space-y-6">
          {/* Create Persona Button */}
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">AI Personas</h2>
            <Button onClick={() => setShowCreatePersona(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Persona
            </Button>
          </div>

          {/* Create Persona Form */}
          <AnimatePresence>
            {showCreatePersona && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      Create New Persona
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowCreatePersona(false)}
                      >
                        ×
                      </Button>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="persona-name">Persona Name</Label>
                      <Input
                        id="persona-name"
                        value={personaName}
                        onChange={(e) => setPersonaName(e.target.value)}
                        placeholder="e.g., Marketing Expert"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="system-prompt">System Prompt</Label>
                      <textarea
                        id="system-prompt"
                        value={systemPrompt}
                        onChange={(e) => setSystemPrompt(e.target.value)}
                        placeholder="You are a marketing expert who creates engaging content..."
                        className="w-full h-24 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="persona-context">Context (Optional)</Label>
                      <textarea
                        id="persona-context"
                        value={personaContext}
                        onChange={(e) => setPersonaContext(e.target.value)}
                        placeholder="Additional context about the persona's expertise..."
                        className="w-full h-20 px-3 py-2 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 resize-none focus:outline-none focus:ring-2 focus:ring-neon-blue"
                      />
                    </div>

                    <div className="flex gap-2">
                      <Button
                        onClick={handleCreatePersona}
                        disabled={!personaName.trim() || !systemPrompt.trim() || isCreatingPersona}
                        className="flex-1"
                      >
                        {isCreatingPersona ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Creating...
                          </>
                        ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Create Persona
                          </>
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setShowCreatePersona(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Personas Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {personas.map((persona) => (
              <motion.div
                key={persona.persona_id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                whileHover={{ scale: 1.02 }}
                className="group"
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-full bg-neon-gradient flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-white mb-2">
                          {persona.persona_name}
                        </h3>
                        
                        <p className="text-sm text-white/70 mb-3 line-clamp-3">
                          {persona.system_prompt}
                        </p>
                        
                        {persona.context && (
                          <p className="text-xs text-white/50 mb-3 line-clamp-2">
                            {persona.context}
                          </p>
                        )}

                        <p className="text-xs text-white/40 mb-4">
                          Created: {new Date(persona.created_at).toLocaleDateString()}
                        </p>

                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1">
                            <Edit className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button variant="outline" size="sm">
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};