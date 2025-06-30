// Meta (Facebook) integration for posting videos via Pica API
import { supabase } from './supabase';

export interface MetaPostRequest {
  account_id: string;
  object_story_id: string;
  page_id?: string;
  name?: string;
}

export interface MetaPostResponse {
  success: boolean;
  creative_id?: string;
  error?: string;
  details?: any;
}

export interface MetaAccount {
  id: string;
  name: string;
  account_id: string;
  page_id?: string;
  isConnected: boolean;
  connectedAt?: Date;
}

export class MetaAPI {
  /**
   * Post a video to Meta (Facebook) using Pica API
   */
  static async postVideoToMeta(request: MetaPostRequest): Promise<MetaPostResponse> {
    try {
      console.log('Posting video to Meta:', request);

      const { data, error } = await supabase.functions.invoke('post-to-meta', {
        body: request,
      });

      if (error) {
        console.error('Meta posting error:', error);
        throw new Error(error.message || 'Failed to post to Meta');
      }

      if (!data.success) {
        throw new Error(data.error || 'Meta posting failed');
      }

      console.log('Meta posting successful:', data);
      return data;

    } catch (error: any) {
      console.error('Meta API error:', error);
      return {
        success: false,
        error: error.message || 'Failed to post to Meta',
      };
    }
  }

  /**
   * Get user's connected Meta accounts (mock implementation)
   */
  static async getConnectedAccounts(userId: string): Promise<MetaAccount[]> {
    // In a real implementation, this would fetch from your database
    // For now, return mock data
    const storedAccounts = localStorage.getItem(`meta_accounts_${userId}`);
    if (storedAccounts) {
      return JSON.parse(storedAccounts);
    }
    return [];
  }

  /**
   * Connect a Meta account (mock implementation)
   */
  static async connectAccount(userId: string, accountData: Partial<MetaAccount>): Promise<MetaAccount> {
    const account: MetaAccount = {
      id: accountData.id || Date.now().toString(),
      name: accountData.name || 'Meta Account',
      account_id: accountData.account_id || '',
      page_id: accountData.page_id,
      isConnected: true,
      connectedAt: new Date(),
    };

    // Store in localStorage for demo
    const existingAccounts = await this.getConnectedAccounts(userId);
    const updatedAccounts = [...existingAccounts, account];
    localStorage.setItem(`meta_accounts_${userId}`, JSON.stringify(updatedAccounts));

    return account;
  }

  /**
   * Disconnect a Meta account
   */
  static async disconnectAccount(userId: string, accountId: string): Promise<void> {
    const accounts = await this.getConnectedAccounts(userId);
    const filteredAccounts = accounts.filter(acc => acc.id !== accountId);
    localStorage.setItem(`meta_accounts_${userId}`, JSON.stringify(filteredAccounts));
  }

  /**
   * Validate Meta account credentials
   */
  static validateAccountId(accountId: string): boolean {
    // Meta Ad Account IDs typically start with 'act_' followed by numbers
    return /^act_\d+$/.test(accountId);
  }

  /**
   * Validate object story ID
   */
  static validateObjectStoryId(objectStoryId: string): boolean {
    // Facebook object story IDs are typically numeric strings
    return /^\d+$/.test(objectStoryId);
  }

  /**
   * Validate page ID
   */
  static validatePageId(pageId: string): boolean {
    // Facebook page IDs are typically numeric strings
    return /^\d+$/.test(pageId);
  }

  /**
   * Format account ID for display
   */
  static formatAccountId(accountId: string): string {
    if (accountId.startsWith('act_')) {
      return accountId.replace('act_', 'Account: ');
    }
    return accountId;
  }

  /**
   * Get posting requirements and tips
   */
  static getPostingRequirements(): {
    requirements: string[];
    tips: string[];
  } {
    return {
      requirements: [
        'Valid Meta Ad Account ID (format: act_1234567890)',
        'Object Story ID of the video post you want to promote',
        'Facebook Page ID (optional but recommended)',
        'Active Pica connection to Meta',
      ],
      tips: [
        'Ensure your video is already posted to Facebook/Instagram',
        'Use high-quality videos for better engagement',
        'Add compelling captions and hashtags to your original post',
        'Consider your target audience when posting',
        'Monitor performance through Meta Ads Manager',
      ],
    };
  }
}

// Export utility functions
export const {
  validateAccountId,
  validateObjectStoryId,
  validatePageId,
  formatAccountId,
  getPostingRequirements,
} = MetaAPI;