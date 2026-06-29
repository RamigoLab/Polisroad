/**
 * delete-user/index.ts — v2
 *
 * Permette di eliminare un utente da auth.users via Admin API.
 * Casi supportati:
 *   1. L'utente elimina se stesso (user.id === uid)
 *   2. Un admin elimina un altro utente (verifica ruolo su profiles)
 */
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const ALLOWED_ORIGINS = [
  'https://polisroad.vercel.app',
  'https://polisroad.it',
];

const getCorsHeaders = (req: Request) => {
  const origin = req.headers.get('origin') ?? '';
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };
};

function json(data: unknown, status = 200, corsHeaders: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...corsHeaders },
  });
}

Deno.serve(async (req: Request) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    );

    // Verifica sessione chiamante
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Nessun header di autorizzazione' }, 401, corsHeaders);
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return json({ error: 'Sessione non autorizzata' }, 401, corsHeaders);
    }

    const { uid } = await req.json();
    if (!uid) {
      return json({ error: "UID dell'utente mancante" }, 400, corsHeaders);
    }

    // Sicurezza: solo se stesso OPPURE admin verificato su profiles
    const isSelf = user.id === uid;
    let isAdmin = false;

    if (!isSelf) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('ruolo')
        .eq('id', user.id)
        .single();
      isAdmin = profile?.ruolo === 'admin';
    }

    if (!isSelf && !isAdmin) {
      return json({ error: 'Operazione non consentita: non sei admin' }, 403, corsHeaders);
    }

    // Elimina l'utente da auth.users
    // Le tabelle figlio vengono pulite tramite CASCADE o dalla chiamata client
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(uid);
    if (deleteError) {
      return json({ error: deleteError.message }, 400, corsHeaders);
    }

    return json({ success: true }, 200, corsHeaders);
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    return json({ error: msg }, 500, getCorsHeaders(req));
  }
});
