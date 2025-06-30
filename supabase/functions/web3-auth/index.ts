import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

interface Web3AuthRequest {
  walletAddress: string
  signature: string
  message: string
  fullName?: string
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { walletAddress, signature, message, fullName }: Web3AuthRequest = await req.json()

    if (!walletAddress || !signature || !message) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    const normalizedAddress = walletAddress.toLowerCase()

    // Check if user already exists
    const { data: existingProfile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('*')
      .eq('wallet_address', normalizedAddress)
      .maybeSingle()

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('Database error:', profileError)
      return new Response(
        JSON.stringify({ error: 'Database error' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    if (existingProfile) {
      // User exists, return existing profile
      return new Response(
        JSON.stringify({ 
          user: existingProfile, 
          isNewUser: false,
          success: true 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    // Create new Web3 user
    const newUserId = crypto.randomUUID()
    const displayName = fullName || `${normalizedAddress.slice(0, 6)}...${normalizedAddress.slice(-4)}`

    const { data: newProfile, error: createError } = await supabaseClient
      .from('profiles')
      .insert([
        {
          id: newUserId,
          wallet_address: normalizedAddress,
          full_name: displayName,
          auth_type: 'web3',
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (createError) {
      console.error('Profile creation error:', createError)
      return new Response(
        JSON.stringify({ error: 'Failed to create user profile' }),
        { 
          status: 500, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      )
    }

    return new Response(
      JSON.stringify({ 
        user: newProfile, 
        isNewUser: true,
        success: true 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )

  } catch (error) {
    console.error('Web3 auth error:', error)
    return new Response(
      JSON.stringify({ error: 'Authentication failed' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    )
  }
})