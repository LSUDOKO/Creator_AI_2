import { atom } from 'jotai';

export interface TavusConversation {
  conversation_id: string;
  conversation_url: string;
  status: 'active' | 'ended';
}

export const tavusConversationAtom = atom<TavusConversation | null>(null);
export const isCreatingConversationAtom = atom(false);