import { useEffect } from 'react'
import { useAtom } from 'jotai'
import { supabase } from '../lib/supabase'
import { userAtom, profileAtom, isLoadingAtom } from '../store/auth'
import { getWalletConnectionDetails } from '../lib/web3'

export const useAuth = () => {
  const [user, setUser] = useAtom(userAtom)
  const [profile, setProfile] = useAtom(profileAtom)
  const [isLoading, setIsLoading] = useAtom(isLoadingAtom)

  useEffect(() => {
    let mounted = true

    // Get initial session
    const getInitialSession = async () => {
      try {
        setIsLoading(true)
        
        // Check for traditional auth session first
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
        }

        if (mounted) {
          if (session?.user) {
            // Traditional auth user
            setUser(session.user)
            await fetchProfile(session.user.id)
          } else {
            // Check for Web3 wallet connection
            try {
              const walletDetails = getWalletConnectionDetails()
              if (walletDetails.isConnected && walletDetails.address) {
                // Try to load Web3 user profile
                await loadWeb3Profile(walletDetails.address)
              } else {
                setUser(null)
                setProfile(null)
              }
            } catch (walletError) {
              console.error('Error checking wallet connection:', walletError)
              setUser(null)
              setProfile(null)
            }
          }
        }
      } catch (error) {
        console.error('Session error:', error)
        if (mounted) {
          setUser(null)
          setProfile(null)
        }
      } finally {
        if (mounted) {
          setIsLoading(false)
        }
      }
    }

    getInitialSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return

        console.log('Auth state changed:', event, session?.user?.email)
        
        if (session?.user) {
          setUser(session.user)
          await fetchProfile(session.user.id)
        } else {
          // Check for Web3 connection when traditional auth is cleared
          try {
            const walletDetails = getWalletConnectionDetails()
            if (walletDetails.isConnected && walletDetails.address) {
              await loadWeb3Profile(walletDetails.address)
            } else {
              setUser(null)
              setProfile(null)
            }
          } catch (walletError) {
            console.error('Error checking wallet connection during auth change:', walletError)
            setUser(null)
            setProfile(null)
          }
        }
      }
    )

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, setIsLoading])

  const fetchProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
        return
      }

      setProfile(data)
    } catch (error) {
      console.error('Error fetching profile:', error)
    }
  }

  const loadWeb3Profile = async (walletAddress: string) => {
    try {
      // Validate wallet address
      if (!walletAddress || typeof walletAddress !== 'string') {
        console.error('Invalid wallet address provided')
        return
      }

      const normalizedAddress = walletAddress.toLowerCase()
      
      // Check if Supabase client is properly configured
      if (!supabase || !supabase.from) {
        console.error('Supabase client not properly configured')
        return
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('wallet_address', normalizedAddress)
        .maybeSingle()

      if (error) {
        console.error('Error fetching Web3 profile:', error)
        // Don't throw here, just log and return
        return
      }

      if (data) {
        // Create a mock user object for Web3 users
        const mockUser = {
          id: data.id,
          email: `${normalizedAddress}@web3.local`,
          user_metadata: {
            wallet_address: normalizedAddress,
            auth_type: 'web3',
            full_name: data.full_name,
          },
          app_metadata: {},
          aud: 'authenticated',
          created_at: data.updated_at,
          updated_at: data.updated_at,
          email_confirmed_at: data.updated_at,
          phone_confirmed_at: null,
          confirmed_at: data.updated_at,
          last_sign_in_at: new Date().toISOString(),
          role: 'authenticated',
          factors: [],
          identities: [],
        }

        setUser(mockUser as any)
        setProfile(data)
      } else {
        console.log('No Web3 profile found for wallet address:', normalizedAddress)
      }
    } catch (error) {
      console.error('Error loading Web3 profile:', error)
      // Don't throw here, just log the error and continue
    }
  }

  const signUp = async (email: string, password: string, fullName: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      })

      if (error) throw error

      if (data.user) {
        // Wait a moment for the user to be fully created in auth.users
        await new Promise(resolve => setTimeout(resolve, 1000))
        
        // Create profile using the authenticated user context
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              full_name: fullName,
              auth_type: 'email',
              updated_at: new Date().toISOString(),
            },
          ])

        if (profileError) {
          console.error('Profile creation error:', profileError)
          // Don't throw here, user is still created
        }
      }

      return { data, error: null }
    } catch (error) {
      console.error('Sign up error:', error)
      return { data: null, error }
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error
      return { data, error: null }
    } catch (error) {
      console.error('Sign in error:', error)
      return { data: null, error }
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      // Sign out from traditional auth
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      
      // Clear Web3 wallet connection
      localStorage.removeItem('wallet_address')
      localStorage.removeItem('wallet_signature')
      localStorage.removeItem('wallet_message')
      
      // Clear local state
      setUser(null)
      setProfile(null)
    } catch (error) {
      console.error('Error signing out:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const connectWeb3Wallet = async () => {
    // This will be handled by the Web3WalletConnector component
    return { success: false, message: 'Use the Web3 wallet connector component' }
  }

  return {
    user,
    profile,
    isLoading,
    signUp,
    signIn,
    signOut,
    connectWeb3Wallet,
    isWeb3User: user?.user_metadata?.auth_type === 'web3',
  }
}