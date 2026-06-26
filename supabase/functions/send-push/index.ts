/**
 * send-push/index.ts
 * Edge Function Supabase per invio notifiche push PWA.
 *
 * SETUP:
 * 1. Genera chiavi VAPID: npx web-push generate-vapid-keys
 * 2. Imposta secrets in Supabase Dashboard → Edge Functions → Secrets:
 *    - VAPID_PUBLIC_KEY   (base64url, chiave pubblica)
 *    - VAPID_PRIVATE_KEY  (base64url PKCS8, chiave privata)
 *    - VAPID_SUBJECT      (es. mailto:admin@polisroad.it)
 * 3. Deploy: supabase functions deploy send-push
 *
 * CHIAMATA (solo da admin autenticato):
 * POST /functions/v1/send-push
 * Headers: Authorization: Bearer <user_access_token>
 * Body: { title, body, url?, userIds? }
 * Se userIds è omesso → broadcast a tutti gli iscritti.
 *
 * NOTA IMPLEMENTATIVA — cifratura Web Push:
 * Il protocollo Web Push richiede che il payload sia cifrato con le chiavi
 * p256dh/auth della subscription (RFC 8291 — Message Encryption for Web Push).
 * Deno/Edge Runtime non ha il pacchetto web-push npm, quindi implementiamo
 * la cifratura manualmente con le Web Crypto API del runtime.
 * Schema: ECDH(server_ephemeral, subscriber_p256dh) → HKDF → AES-128-GCM.
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@polisroad.it';

const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ─── Entry point ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin':  '*',
        'Access-Control-Allow-Headers': 'authorization, content-type',
      },
    });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return json({ error: 'Unauthorized' }, 401);
    }

    const supabaseAdmin = createClient(supabaseUrl, supabaseService);
    const supabaseUser  = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Verifica che il chiamante sia admin
    const { data: { user } } = await supabaseUser.auth.getUser();
    if (!user) return json({ error: 'Unauthorized' }, 401);

    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('ruolo')
      .eq('id', user.id)
      .single();

    if (profile?.ruolo !== 'admin') return json({ error: 'Forbidden' }, 403);

    const { title, body, url = '/', userIds } = await req.json();
    if (!title || !body) return json({ error: 'title e body sono obbligatori' }, 400);

    // Recupera subscription
    let query = supabaseAdmin.from('push_subscriptions').select('*');
    if (userIds?.length) query = query.in('user_id', userIds);
    const { data: subscriptions, error: subErr } = await query;
    if (subErr) throw subErr;

    if (!subscriptions?.length) {
      return json({ sent: 0, failed: 0, message: 'Nessun subscriber trovato' });
    }

    const payload = JSON.stringify({
      title,
      body,
      url,
      icon:  '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    });

    let sent = 0;
    let failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const status = await sendEncryptedPush({
          endpoint:       sub.endpoint,
          p256dh:         sub.p256dh,
          auth:           sub.auth,
          payload,
          vapidPublicKey:  VAPID_PUBLIC_KEY,
          vapidPrivateKey: VAPID_PRIVATE_KEY,
          vapidSubject:    VAPID_SUBJECT,
        });

        if (status === 410 || status === 404) {
          expiredEndpoints.push(sub.endpoint);
          failed++;
        } else if (status >= 200 && status < 300) {
          sent++;
        } else {
          failed++;
        }
      } catch (err) {
        console.error('send-push: errore invio singolo', err);
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

    return json({ sent, failed, expired: expiredEndpoints.length });
  } catch (err) {
    console.error('send-push: errore generale', err);
    return json({ error: 'Internal error' }, 500);
  }
});

// ─── Helper JSON response ─────────────────────────────────────────────────────
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

// ─── Invio Web Push cifrato (RFC 8291 + RFC 8292) ────────────────────────────
/**
 * Costruisce e invia un messaggio Web Push con:
 * - Payload cifrato: ECDH(server_ephemeral ↔ subscriber_p256dh) + HKDF + AES-128-GCM
 * - VAPID authentication: JWT ES256 firmato con la chiave privata VAPID
 */
async function sendEncryptedPush({
  endpoint, p256dh, auth, payload,
  vapidPublicKey, vapidPrivateKey, vapidSubject,
}: {
  endpoint: string; p256dh: string; auth: string; payload: string;
  vapidPublicKey: string; vapidPrivateKey: string; vapidSubject: string;
}): Promise<number> {
  // 1. Genera coppia di chiavi efimere server (P-256)
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' },
    true,
    ['deriveKey', 'deriveBits'],
  );

  // Esporta la chiave pubblica server in formato raw (65 byte uncompressed)
  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', serverKeyPair.publicKey)
  );

  // 2. Importa la chiave pubblica del subscriber (p256dh)
  const subscriberPublicKeyRaw = base64urlToUint8Array(p256dh);
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw', subscriberPublicKeyRaw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false, [],
  );

  // 3. ECDH shared secret
  const sharedSecretBits = await crypto.subtle.deriveBits(
    { name: 'ECDH', public: subscriberPublicKey },
    serverKeyPair.privateKey,
    256,
  );

  // 4. Salt casuale (16 byte)
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 5. HKDF per derivare la chiave di cifratura e il nonce (RFC 8291)
  const authSecret   = base64urlToUint8Array(auth);
  const prk          = await hkdf(authSecret, new Uint8Array(sharedSecretBits),
                                  concat(utf8('Content-Encoding: auth\0'), new Uint8Array([1])), 32);
  const keyInfo      = concat(utf8('Content-Encoding: aes128gcm\0'), new Uint8Array([1]));
  const nonceInfo    = concat(utf8('Content-Encoding: nonce\0'), new Uint8Array([1]));
  const context      = concat(utf8('P-256\0'),
                              new Uint8Array([0, subscriberPublicKeyRaw.length]),
                              subscriberPublicKeyRaw,
                              new Uint8Array([0, serverPublicKeyRaw.length]),
                              serverPublicKeyRaw);
  const keyInfoFull  = concat(utf8('Content-Encoding: aesgcm\0'), context, keyInfo);
  const nonceInfoFull= concat(utf8('Content-Encoding: nonce\0'), context, nonceInfo);

  const contentKey = await hkdf(salt, prk, keyInfoFull, 16);
  const nonce      = await hkdf(salt, prk, nonceInfoFull, 12);

  // 6. Importa la chiave AES-128-GCM e cifra il payload
  const aesKey = await crypto.subtle.importKey(
    'raw', contentKey, { name: 'AES-GCM' }, false, ['encrypt']
  );
  const paddedPayload = addPadding(utf8(payload));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, paddedPayload)
  );

  // 7. Costruisci il corpo della richiesta HTTP (RFC 8188)
  //    salt (16) + record_size (4) + key_len (1) + server_public_key (65) + ciphertext
  const recordSize   = ciphertext.length + 16 + 1;
  const recordSizeBuf = new Uint8Array(4);
  new DataView(recordSizeBuf.buffer).setUint32(0, recordSize, false);

  const body = concat(
    salt,
    recordSizeBuf,
    new Uint8Array([serverPublicKeyRaw.length]),
    serverPublicKeyRaw,
    ciphertext,
  );

  // 8. VAPID JWT (RFC 8292)
  const vapidJwt = await buildVapidJwt(endpoint, vapidPublicKey, vapidPrivateKey, vapidSubject);

  // 9. HTTP POST all'endpoint push
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type':     'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Authorization':    `vapid t=${vapidJwt},k=${vapidPublicKey}`,
      'TTL':              '86400',
    },
    body,
  });

  return resp.status;
}

// ─── VAPID JWT ────────────────────────────────────────────────────────────────
async function buildVapidJwt(endpoint: string, pubKey: string, privKey: string, subject: string) {
  const origin  = new URL(endpoint).origin;
  const now     = Math.floor(Date.now() / 1000);

  const header = b64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = b64url(JSON.stringify({ aud: origin, exp: now + 43200, sub: subject }));

  const privateKeyBytes = base64urlToUint8Array(privKey);
  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', privateKeyBytes,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  );

  const sigInput = utf8(`${header}.${claims}`);
  const sigBuf   = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, cryptoKey, sigInput);
  const sig      = uint8ToB64url(new Uint8Array(sigBuf));

  return `${header}.${claims}.${sig}`;
}

// ─── Utilità crittografiche ───────────────────────────────────────────────────
async function hkdf(salt: Uint8Array, ikm: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const ikmKey   = await crypto.subtle.importKey('raw', ikm, { name: 'HKDF' }, false, ['deriveBits']);
  const bits     = await crypto.subtle.deriveBits({ name: 'HKDF', hash: 'SHA-256', salt, info }, ikmKey, length * 8);
  return new Uint8Array(bits);
}

function addPadding(data: Uint8Array): Uint8Array {
  // Aggiunge il delimiter byte 0x02 richiesto da RFC 8291
  const padded = new Uint8Array(data.length + 1);
  padded.set(data);
  padded[data.length] = 2;
  return padded;
}

function concat(...arrays: Uint8Array[]): Uint8Array {
  const total = arrays.reduce((n, a) => n + a.length, 0);
  const result = new Uint8Array(total);
  let offset = 0;
  for (const a of arrays) { result.set(a, offset); offset += a.length; }
  return result;
}

function utf8(str: string): Uint8Array {
  return new TextEncoder().encode(str);
}

function base64urlToUint8Array(base64url: string): Uint8Array {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded  = base64 + '='.repeat((4 - base64.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

function b64url(str: string): string {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function uint8ToB64url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
