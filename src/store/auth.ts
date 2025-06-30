import { atom } from 'jotai'
import { User } from '@supabase/supabase-js'
import { Profile } from '../lib/supabase'

export const userAtom = atom<User | null>(null)
export const profileAtom = atom<Profile | null>(null)
export const isLoadingAtom = atom(false)
export const isAuthenticatedAtom = atom((get) => get(userAtom) !== null)