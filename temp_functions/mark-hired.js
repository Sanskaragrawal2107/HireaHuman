import { createClient } from 'npm:@insforge/sdk';

function getUserIdFromToken(token) {
  try {
    const payload = token.split('.')[1];
    const decoded = JSON.parse(atob(payload));
    return decoded.sub || decoded.user_id || decoded.id || null;
  } catch {
    return null;
  }
}

export default async function(req) {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!userToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const userId = getUserIdFromToken(userToken);
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      edgeFunctionToken: userToken,
    });

    // Verify caller owns a verified/paid company
    const { data: company, error: companyErr } = await client.database
      .from('companies')
      .select('id, name, status, subscription_status')
      .eq('user_id', userId)
      .single();

    if (companyErr || !company) {
      return new Response(JSON.stringify({ error: 'No company found for this user' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (company.subscription_status !== 'paid' && company.subscription_status !== 'active') {
      return new Response(JSON.stringify({ error: 'Company not verified/paid' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { candidate_handle } = body;

    if (!candidate_handle) {
      return new Response(JSON.stringify({ error: 'Missing candidate_handle' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Look up candidate profile
    const { data: profile, error: profileErr } = await client.database
      .from('profiles')
      .select('id')
      .eq('handle', candidate_handle)
      .single();

    if (profileErr || !profile?.id) {
      return new Response(JSON.stringify({ error: `Candidate "@${candidate_handle}" not found` }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Upsert hiring record
    const { error: hiringErr } = await client.database
      .from('hirings')
      .upsert([{
        candidate_id: profile.id,
        company_id: company.id,
        status: 'hired',
        hired_at: new Date().toISOString(),
        email_sent: true,
      }], { onConflict: 'candidate_id,company_id' });

    if (hiringErr) throw new Error('Failed to update hiring record: ' + hiringErr.message);

    // Update candidate's profile status — server-side bypasses RLS
    const { error: profileUpdateErr } = await client.database
      .from('profiles')
      .update({
        employment_status: 'HIRED',
        hired_company_id: company.id,
      })
      .eq('id', profile.id);

    if (profileUpdateErr) throw new Error('Failed to update profile status: ' + profileUpdateErr.message);

    return new Response(JSON.stringify({ success: true, candidate_id: profile.id, company_id: company.id }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    console.error('mark-hired error:', err);
    return new Response(JSON.stringify({ error: err.message || 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
