import { createClient } from 'npm:@insforge/sdk';

export default async function(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;

    console.log('[check-admin] Auth header present:', !!authHeader);
    console.log('[check-admin] Token extracted:', userToken ? userToken.substring(0, 20) + '...' : 'none');

    if (!userToken) {
      console.log('[check-admin] No token provided');
      return new Response(JSON.stringify({ isAdmin: false, reason: 'No token' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      edgeFunctionToken: userToken,
    });

    console.log('[check-admin] Getting current user...');
    const { data: userData, error: userError } = await client.auth.getCurrentUser();
    
    if (userError) {
      console.error('[check-admin] getCurrentUser error:', userError);
      return new Response(JSON.stringify({ 
        isAdmin: false, 
        reason: 'User auth failed',
        error: userError.message 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (!userData?.user?.id) {
      console.log('[check-admin] No user data returned');
      return new Response(JSON.stringify({ isAdmin: false, reason: 'No user data' }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = userData.user.id;
    console.log('[check-admin] User ID:', userId);

    // Check admin_users table (RLS will scope to own user_id only)
    console.log('[check-admin] Querying admin_users table...');
    const { data: adminRecord, error: dbError } = await client.database
      .from('admin_users')
      .select('role')
      .eq('user_id', userId)
      .maybeSingle();

    if (dbError) {
      console.error('[check-admin] Database query error:', dbError);
      return new Response(JSON.stringify({ 
        isAdmin: false,
        reason: 'Database error',
        error: dbError.message,
        userId: userId
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[check-admin] Admin record found:', !!adminRecord);
    console.log('[check-admin] Admin role:', adminRecord?.role);

    return new Response(JSON.stringify({
      isAdmin: !!adminRecord,
      role: adminRecord?.role || null,
      userId: userId
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('[check-admin] Unexpected error:', err);
    return new Response(JSON.stringify({ 
      isAdmin: false,
      reason: 'Exception caught',
      error: err.message
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
