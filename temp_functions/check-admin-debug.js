import { createClient } from 'npm:@insforge/sdk';

// Helper to decode JWT and extract user ID
function getUserIdFromToken(token) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = JSON.parse(atob(parts[1]));
    return payload.sub || payload.user_id || null;
  } catch (err) {
    console.error('[check-admin] Token decode error:', err);
    return null;
  }
}

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

    // Decode JWT token to get user ID
    const userId = getUserIdFromToken(userToken);
    
    if (!userId) {
      console.log('[check-admin] Could not extract user ID from token');
      return new Response(JSON.stringify({ 
        isAdmin: false, 
        reason: 'Invalid token format'
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    console.log('[check-admin] User ID from token:', userId);

    // Use user token for authenticated database access (RLS needs auth context)
    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      edgeFunctionToken: userToken
    });

    // Check admin_users table (RLS policy allows user to see their own row)
    console.log('[check-admin] Querying admin_users table for user_id:', userId);
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
