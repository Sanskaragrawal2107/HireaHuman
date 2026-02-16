import { createClient } from 'npm:@insforge/sdk';

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
    // Verify the caller is authenticated
    const authHeader = req.headers.get('Authorization');
    const userToken = authHeader ? authHeader.replace('Bearer ', '') : null;

    if (!userToken) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const client = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      edgeFunctionToken: userToken,
    });

    // Verify user identity
    const { data: userData } = await client.auth.getCurrentUser();
    if (!userData?.user?.id) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verify user owns a verified company
    const { data: company } = await client.database
      .from('companies')
      .select('id, name, email, status')
      .eq('user_id', userData.user.id)
      .single();

    if (!company || company.status !== 'verified') {
      return new Response(JSON.stringify({ error: 'Only verified companies can send hire emails' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Parse request body
    const body = await req.json();
    const { to, subject, emailBody, candidate_handle } = body;

    if (!to || !subject || !emailBody) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, emailBody' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limit: max 10 emails per company per day
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const anonClient = createClient({
      baseUrl: Deno.env.get('INSFORGE_BASE_URL'),
      anonKey: Deno.env.get('ANON_KEY'),
    });

    const { data: recentHirings } = await anonClient.database
      .from('hirings')
      .select('id')
      .eq('company_id', company.id)
      .gte('created_at', oneDayAgo);

    if (recentHirings && recentHirings.length >= 10) {
      return new Response(JSON.stringify({ error: 'Daily email limit reached (10/day)' }), {
        status: 429,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Forward to Make.com webhook (URL stays server-side only)
    const WEBHOOK_URL = Deno.env.get('MAKE_WEBHOOK_URL') || 'https://hook.eu1.make.com/3komnjzx9fhwggdsfep7p16utck1zt20';

    const webhookResponse = await fetch(WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to,
        subject,
        body: emailBody,
        from_company: company.name,
        recruiter_email: company.email,
      }),
    });

    if (!webhookResponse.ok) {
      return new Response(JSON.stringify({ error: 'Failed to deliver email' }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Record hiring in DB if candidate handle provided
    if (candidate_handle) {
      const { data: profile } = await anonClient.database
        .from('profiles')
        .select('id')
        .eq('handle', candidate_handle)
        .single();

      if (profile?.id) {
        await client.database.from('hirings').insert([{
          candidate_id: profile.id,
          company_id: company.id,
          status: 'offered',
          email_sent: true,
          notes: 'Email sent: ' + subject,
        }]);
      }
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
}
