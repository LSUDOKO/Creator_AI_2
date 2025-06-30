// Tavus API integration
const TAVUS_API_BASE = 'https://tavusapi.com/v2';

export interface CreateConversationRequest {
  replica_id: string;
  custom_greeting?: string;
  conversational_context?: string;
}

export interface CreateVideoRequest {
  replica_id: string;
  script: string;
  persona_id?: string;
}

export interface CreateVideoFromAudioRequest {
  replica_id: string;
  audio_url: string;
  persona_id?: string;
}

export interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: 'active' | 'ended';
}

export interface TavusVideo {
  video_id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  download_url?: string;
  hosted_url?: string;
  progress?: number;
}

export interface TavusReplica {
  replica_id: string;
  replica_name: string;
  thumbnail_image_url?: string;
  status: 'ready' | 'training' | 'failed';
  voice_id?: string;
  created_at: string;
}

export interface TavusPersona {
  persona_id: string;
  persona_name: string;
  system_prompt?: string;
  context?: string;
  created_at: string;
}

export class TavusAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async createConversation(request: CreateConversationRequest): Promise<TavusConversation> {
    const response = await fetch(`${TAVUS_API_BASE}/conversations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create conversation: ${response.statusText}`);
    }

    return response.json();
  }

  async endConversation(conversationId: string): Promise<void> {
    const response = await fetch(`${TAVUS_API_BASE}/conversations/${conversationId}/end`, {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to end conversation: ${response.statusText}`);
    }
  }

  async createVideo(request: CreateVideoRequest): Promise<TavusVideo> {
    const response = await fetch(`${TAVUS_API_BASE}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create video: ${response.statusText}`);
    }

    return response.json();
  }

  async createVideoFromAudio(request: CreateVideoFromAudioRequest): Promise<TavusVideo> {
    const response = await fetch(`${TAVUS_API_BASE}/videos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create video from audio: ${response.statusText}`);
    }

    return response.json();
  }

  async getVideo(videoId: string): Promise<TavusVideo> {
    const response = await fetch(`${TAVUS_API_BASE}/videos/${videoId}`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get video: ${response.statusText}`);
    }

    return response.json();
  }

  async getReplicas(): Promise<TavusReplica[]> {
    const response = await fetch(`${TAVUS_API_BASE}/replicas`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get replicas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.replicas || [];
  }

  async getPersonas(): Promise<TavusPersona[]> {
    const response = await fetch(`${TAVUS_API_BASE}/personas`, {
      method: 'GET',
      headers: {
        'x-api-key': this.apiKey,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get personas: ${response.statusText}`);
    }

    const data = await response.json();
    return data.personas || [];
  }

  async createReplica(request: {
    replica_name: string;
    train_video_url: string;
    callback_url?: string;
  }): Promise<TavusReplica> {
    const response = await fetch(`${TAVUS_API_BASE}/replicas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create replica: ${response.statusText}`);
    }

    return response.json();
  }

  async createPersona(request: {
    persona_name: string;
    system_prompt: string;
    context?: string;
  }): Promise<TavusPersona> {
    const response = await fetch(`${TAVUS_API_BASE}/personas`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to create persona: ${response.statusText}`);
    }

    return response.json();
  }
}