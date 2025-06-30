import { atom } from 'jotai';

export type Page = 'home' | 'content-creation' | 'content-automation' | 'pricing' | 'login' | 'success';

export const currentPageAtom = atom<Page>('home');