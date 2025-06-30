// Pica AI integration for social media automation
const PICA_SECRET_KEY = import.meta.env.VITE_PICA_SECRET_KEY;
const PICA_API_BASE = 'https://api.picahq.com/v1';

export interface PicaConnector {
  id: string;
  platform: string;
  username?: string;
  isConnected: boolean;
  connectedAt?: Date;
  accessToken?: string;
}

export interface PicaAuthUrl {
  authUrl: string;
  state: string;
}

export interface PicaPostRequest {
  content: string;
  mediaUrl?: string;
  platforms: string[];
  scheduleTime?: Date;
  userId: string;
}

export interface PicaPostResponse {
  success: boolean;
  postId: string;
  platform: string;
  scheduledFor?: Date;
  error?: string;
}

export class PicaAPI {
  private apiKey: string;

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  /**
   * Get OAuth URL for connecting a social media platform
   */
  async getConnectorAuthUrl(params: {
    connector: string;
    userId: string;
    callbackUrl: string;
  }): Promise<PicaAuthUrl> {
    const response = await fetch(`${PICA_API_BASE}/connectors/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to get auth URL: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get connected social media accounts for a user
   */
  async getConnectedAccounts(userId: string): Promise<PicaConnector[]> {
    const response = await fetch(`${PICA_API_BASE}/connectors?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get connected accounts: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Disconnect a social media account
   */
  async disconnectAccount(connectorId: string): Promise<void> {
    const response = await fetch(`${PICA_API_BASE}/connectors/${connectorId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to disconnect account: ${response.statusText}`);
    }
  }

  /**
   * Generate system prompt for Pica agent
   */
  async generateSystemPrompt(): Promise<string> {
    const response = await fetch(`${PICA_API_BASE}/agent/system-prompt`, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to generate system prompt: ${response.statusText}`);
    }

    const data = await response.json();
    return data.systemPrompt;
  }

  /**
   * Execute Pica agent with natural language prompt
   */
  async executeAgent(params: {
    prompt: string;
    userId: string;
    mediaUrl?: string;
    contentType?: 'text' | 'image' | 'video';
  }): Promise<PicaPostResponse[]> {
    const response = await fetch(`${PICA_API_BASE}/agent/execute`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to execute agent: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Post content to specific platforms
   */
  async postContent(request: PicaPostRequest): Promise<PicaPostResponse[]> {
    const response = await fetch(`${PICA_API_BASE}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new Error(`Failed to post content: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get supported social media platforms
   */
  static getSupportedPlatforms(): Array<{
    id: string;
    name: string;
    icon: string;
    color: string;
    features: string[];
  }> {
    return [
      {
        id: 'instagram',
        name: 'Instagram',
        icon: '📷',
        color: '#E4405F',
        features: ['Posts', 'Stories', 'Reels'],
      },
      {
        id: 'youtube',
        name: 'YouTube',
        icon: '📺',
        color: '#FF0000',
        features: ['Videos', 'Shorts', 'Community Posts'],
      },
      {
        id: 'twitter',
        name: 'Twitter/X',
        icon: '🐦',
        color: '#1DA1F2',
        features: ['Tweets', 'Threads', 'Spaces'],
      },
      {
        id: 'linkedin',
        name: 'LinkedIn',
        icon: '💼',
        color: '#0077B5',
        features: ['Posts', 'Articles', 'Stories'],
      },
      {
        id: 'facebook',
        name: 'Facebook',
        icon: '👥',
        color: '#1877F2',
        features: ['Posts', 'Stories', 'Reels'],
      },
      {
        id: 'tiktok',
        name: 'TikTok',
        icon: '🎵',
        color: '#000000',
        features: ['Videos', 'Live Streams'],
      },
    ];
  }
}

// Create singleton instance
export const picaAPI = PICA_SECRET_KEY ? new PicaAPI(PICA_SECRET_KEY) : null;

/**
 * Utility function to handle OAuth callback
 */
export async function handlePicaCallback(params: {
  connectorId: string;
  accessToken: string;
  userId: string;
  platform: string;
  username?: string;
}): Promise<PicaConnector> {
  // In a real app, you'd save this to your database
  const connector: PicaConnector = {
    id: params.connectorId,
    platform: params.platform,
    username: params.username,
    isConnected: true,
    connectedAt: new Date(),
    accessToken: params.accessToken,
  };

  // Store in localStorage for demo purposes
  const existingConnectors = JSON.parse(
    localStorage.getItem(`pica_connectors_${params.userId}`) || '[]'
  );
  
  const updatedConnectors = [
    ...existingConnectors.filter((c: PicaConnector) => c.id !== params.connectorId),
    connector,
  ];
  
  localStorage.setItem(
    `pica_connectors_${params.userId}`,
    JSON.stringify(updatedConnectors)
  );

  return connector;
}

/**
 * Get stored connectors for demo purposes
 */
export function getStoredConnectors(userId: string): PicaConnector[] {
  return JSON.parse(
    localStorage.getItem(`pica_connectors_${userId}`) || '[]'
  );
}

/**
 * Remove stored connector
 */
export function removeStoredConnector(userId: string, connectorId: string): void {
  const connectors = getStoredConnectors(userId);
  const filtered = connectors.filter(c => c.id !== connectorId);
  localStorage.setItem(`pica_connectors_${userId}`, JSON.stringify(filtered));
}