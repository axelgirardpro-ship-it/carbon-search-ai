import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Get user from JWT
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    )

    if (authError || !user) {
      return new Response('Unauthorized', { status: 401, headers: corsHeaders })
    }

    // Check if user is supra admin
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'supra_admin')
      .is('workspace_id', null)
      .single()

    if (!roleData) {
      return new Response('Forbidden', { status: 403, headers: corsHeaders })
    }

    // Get all workspaces with details
    const { data: workspaces, error: workspacesError } = await supabase
      .from('workspaces')
      .select('*')
      .order('created_at', { ascending: false })

    if (workspacesError) throw workspacesError

    // Get detailed info for each workspace
    const workspacesWithDetails = await Promise.all(
      (workspaces || []).map(async (workspace) => {
        // Get owner details from auth.users
        const { data: authUser, error: authUserError } = await supabase.auth.admin.getUserById(workspace.owner_id)
        
        // Count users in this workspace
        const { count: userCount } = await supabase
          .from('user_roles')
          .select('*', { count: 'exact', head: true })
          .eq('workspace_id', workspace.id)

        // Get subscription info
        const { data: subscription } = await supabase
          .from('subscribers')
          .select('plan_type, subscribed')
          .eq('user_id', workspace.owner_id)
          .single()

        return {
          ...workspace,
          owner_email: authUser?.user?.email || 'Unknown',
          user_count: userCount || 0,
          subscription_status: subscription || { plan_type: 'freemium', subscribed: false }
        }
      })
    )

    return new Response(
      JSON.stringify({ data: workspacesWithDetails }),
      { 
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        } 
      }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        status: 500,
        headers: { 
          ...corsHeaders,
          'Content-Type': 'application/json'
        }
      }
    )
  }
})