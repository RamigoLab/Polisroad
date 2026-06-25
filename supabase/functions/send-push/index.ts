/**
 * send-push/index.ts
 * Edge Function Supabase per invio notifiche push PWA.
 *
 * SETUP:
 * 1. Genera chiavi VAPID: npx web-push generate-vapid-keys
 * 2. Imposta secrets in Supabase Dashboard → Edge Functions → Secrets:
 *    - VAPID_PUBLIC_KEY
 *    - VAPID_PRIVATE_KEY
 *    - VAPID_SUBJECT (es. mailto:admin@polisroad.it)
 * 3. Deploy: supabase functions deploy send-push
 *
 * CHIAMATA (solo da codice admin o da altro Edge Function):
 * POST /functions/v1/send-push
 * Body: { title, body, url?, userIds? }
 * Se userIds è omesso, invia a tutti gli iscritti (broadcast).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@polisroad.it';

const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req: Request) => {
  // CORS per chiamate da frontend admin
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    // Verifica che la chiamata venga da un admin
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseService);
    const supabaseUser  = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verifica ruolo admin
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('ruolo')
      .eq('id', user.id)
      .single();

    if (profile?.ruolo !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), { status: 403 });
    }

    const { title, body, url = '/', userIds } = await req.json();

    // Recupera subscription
    let query = supabaseAdmin.from('push_subscriptions').select('*');
    if (userIds?.length) query = query.in('user_id', userIds);
    const { data: subscriptions, error: subErr } = await query;
    if (subErr) throw subErr;

    if (!subscriptions?.length) {
      return new Response(JSON.stringify({ sent: 0, message: 'Nessun subscriber trovato' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Payload notifica
    const payload = JSON.stringify({
      title,
      body,
      url,
      icon: '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    });

    // Invia a ogni subscription
    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        // Web Push manuale via fetch (Deno non ha web-push npm)
        const pushResp = await sendWebPush({
          endpoint: sub.endpoint,
          p256dh: sub.p256dh,
          auth: sub.auth,
          payload,
          vapidPublicKey: VAPID_PUBLIC_KEY,
          vapidPrivateKey: VAPID_PRIVATE_KEY,
          vapidSubject: VAPID_SUBJECT,
        });

        if (pushResp === 410 || pushResp === 404) {
          // Subscription scaduta — rimuovi
          expiredEndpoints.push(sub.endpoint);
          failed++;
        } else {
          sent++;
        }
      } catch {
        failed++;
      }
    }

    // Rimuovi subscription scadute
    if (expiredEndpoints.length) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return new Response(
      JSON.stringify({ sent, failed, expired: expiredEndpoints.length }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('send-push error:', err);
    return new Response(JSON.stringify({ error: 'Internal error' }), { status: 500 });
  }
});

/**
 * Invio Web Push manuale via JWT VAPID.
 * Nota: in Deno/Edge Runtime non è disponibile il pacchetto web-push npm,
 * quindi costruiamo il JWT VAPID manualmente con le Web Crypto API.
 */
async function sendWebPush({
  endpoint, p256dh, auth, payload,
  vapidPublicKey, vapidPrivateKey, vapidSubject,
}: {
  endpoint: string; p256dh: string; auth: string; payload: string;
  vapidPublicKey: string; vapidPrivateKey: string; vapidSubject: string;
}): Promise<number> {
  const origin = new URL(endpoint).origin;
  const audience = origin;
  const now = Math.floor(Date.now() / 1000);

  // JWT VAPID header + claims
  const header = btoa(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
  const claims = btoa(JSON.stringify({ aud: audience, exp: now + 43200, sub: vapidSubject }))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');

  // Importa chiave privata VAPID (PKCS8 base64url)
  const privateKeyBytes = Uint8Array.from(atob(vapidPrivateKey.replace(/-/g,'+').replace(/_/g,'/')), c => c.charCodeAt(0));
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign']
  );

  const sigInput = new TextEncoder().encode(`${header}.${claims}`);
  const sigBuf = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, cryptoKey, sigInput);
  const sig = btoa(String.fromCharCode(...new Uint8Array(sigBuf)))
    .replace(/=/g,'').replace(/\+/g,'-').replace(/\//g,'_');

  const jwt = `${header}.${claims}.${sig}`;

  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/octet-stream',
      'Authorization': `vapid t=${jwt},k=${vapidPublicKey}`,
      'TTL': '86400',
    },
    body: new TextEncoder().encode(payload),
  });

  return resp.status;
}
