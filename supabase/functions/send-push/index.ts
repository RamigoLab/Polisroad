/**
 * send-push/index.ts — v3
 * Usa npm:web-push per la cifratura invece dell'implementazione manuale.
 * Risolve i problemi di cifratura HKDF/AES-GCM che causavano payload invalidi.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import webpush from 'npm:web-push@3.6.7';

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@polisroad.it';
const supabaseUrl       = Deno.env.get('SUPABASE_URL')!;
const supabaseService   = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const CORS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS },
  });
}

// Configura VAPID una volta sola all'avvio
webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY);

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: CORS });

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return json({ error: 'Unauthorized' }, 401);

    const supabaseAdmin = createClient(supabaseUrl, supabaseService);
    const supabaseUser  = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabaseAdmin
      .from('profiles').select('ruolo').eq('id', user.id).single();
    if (profile?.ruolo !== 'admin') return json({ error: 'Forbidden' }, 403);

    const { title, body, url = '/', userIds } = await req.json();
    if (!title || !body) return json({ error: 'title e body obbligatori' }, 400);

    let query = supabaseAdmin.from('push_subscriptions').select('*');
    if (userIds?.length) query = query.in('user_id', userIds);
    const { data: subscriptions, error: subErr } = await query;
    if (subErr) throw subErr;
    if (!subscriptions?.length) return json({ sent: 0, failed: 0, message: 'Nessun subscriber' });

    const payload = JSON.stringify({
      title, body, url,
      icon:  '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    });

    let sent = 0, failed = 0;
    const expired: string[] = [];

    for (const sub of subscriptions) {
      try {
        const pushSubscription = {
          endpoint: sub.endpoint,
          keys: {
            p256dh: sub.p256dh,
            auth:   sub.auth,
          },
        };

        const result = await webpush.sendNotification(pushSubscription, payload, {
          TTL: 86400,
        });

        console.log('push inviato, status:', result.statusCode);

        if (result.statusCode === 410 || result.statusCode === 404) {
          expired.push(sub.endpoint);
          failed++;
        } else if (result.statusCode >= 200 && result.statusCode < 300) {
          sent++;
        } else {
          console.error('status inatteso:', result.statusCode, result.body);
          failed++;
        }
      } catch (e: any) {
        console.error('errore singolo:', e?.statusCode, e?.body || e);
        if (e?.statusCode === 410 || e?.statusCode === 404) {
          expired.push(sub.endpoint);
        }
        failed++;
      }
    }

    if (expired.length) {
      await supabaseAdmin.from('push_subscriptions').delete().in('endpoint', expired);
    }

    return json({ sent, failed, expired: expired.length });
  } catch (e) {
    console.error('errore generale:', e);
    return json({ error: String(e) }, 500);
  }
});
