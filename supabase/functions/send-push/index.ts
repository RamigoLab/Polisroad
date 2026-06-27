/**
 * send-push/index.ts
 * Edge Function Supabase per invio notifiche push PWA.
 *
 * SETUP:
 * 1. Genera chiavi VAPID: npx web-push generate-vapid-keys
 * 2. Imposta secrets in Supabase Dashboard → Edge Functions → Secrets:
 *    - VAPID_PUBLIC_KEY   (base64url, chiave pubblica ES256 P-256)
 *    - VAPID_PRIVATE_KEY  (base64url RAW 32 byte — output di web-push)
 *    - VAPID_SUBJECT      (es. mailto:admin@polisroad.it)
 * 3. Deploy: supabase functions deploy send-push
 *
 * FIX v1.8.9:
 * - Aggiunto header CORS (Access-Control-Allow-Origin: *) su TUTTE le risposte,
 *   non solo OPTIONS. Senza di esso il browser blocca la risposta e il fetch
 *   finisce nel catch con "Errore di rete".
 * - VAPID private key: web-push genera chiavi RAW (32 byte), non PKCS8.
 *   Convertita la chiave raw → PKCS8 wrapping prima di importKey.
 * - Rimossa la doppia context-info HKDF (misto aesgcm/aes128gcm).
 *   Usato schema aes128gcm puro (RFC 8291 §3.4).
 */

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const VAPID_PUBLIC_KEY  = Deno.env.get('VAPID_PUBLIC_KEY')!;
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')!;
const VAPID_SUBJECT     = Deno.env.get('VAPID_SUBJECT') ?? 'mailto:admin@polisroad.it';

const supabaseUrl     = Deno.env.get('SUPABASE_URL')!;
const supabaseService = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ─── CORS headers (aggiunti a TUTTE le risposte) ──────────────────────────────
const CORS_HEADERS = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ─── Entry point ──────────────────────────────────────────────────────────────
Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: CORS_HEADERS });
  }

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
      .from('profiles')
      .select('ruolo')
      .eq('id', user.id)
      .single();

    if (profile?.ruolo !== 'admin') return json({ error: 'Forbidden' }, 403);

    const { title, body, url = '/', userIds } = await req.json();
    if (!title || !body) return json({ error: 'title e body sono obbligatori' }, 400);

    let query = supabaseAdmin.from('push_subscriptions').select('*');
    if (userIds?.length) query = query.in('user_id', userIds);
    const { data: subscriptions, error: subErr } = await query;
    if (subErr) throw subErr;

    if (!subscriptions?.length) {
      return json({ sent: 0, failed: 0, message: 'Nessun subscriber trovato' });
    }

    const payload = JSON.stringify({ title, body, url,
      icon:  '/icons/icon-192.png',
      badge: '/icons/icon-192.png',
    });

    let sent = 0, failed = 0;
    const expiredEndpoints: string[] = [];

    for (const sub of subscriptions) {
      try {
        const status = await sendEncryptedPush({
          endpoint:        sub.endpoint,
          p256dh:          sub.p256dh,
          auth:            sub.auth,
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
          console.error('send-push: status inatteso', status);
          failed++;
        }
      } catch (err) {
        console.error('send-push: errore invio singolo', err);
        failed++;
      }
    }

    if (expiredEndpoints.length) {
      await supabaseAdmin
        .from('push_subscriptions')
        .delete()
        .in('endpoint', expiredEndpoints);
    }

    return json({ sent, failed, expired: expiredEndpoints.length });
  } catch (err) {
    console.error('send-push: errore generale', err);
    return json({ error: String(err) }, 500);
  }
});

// ─── Helper JSON con CORS ─────────────────────────────────────────────────────
function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json', ...CORS_HEADERS },
  });
}

// ─── Web Push cifrato RFC 8291 (schema aes128gcm) ────────────────────────────
async function sendEncryptedPush({
  endpoint, p256dh, auth, payload,
  vapidPublicKey, vapidPrivateKey, vapidSubject,
}: {
  endpoint: string; p256dh: string; auth: string; payload: string;
  vapidPublicKey: string; vapidPrivateKey: string; vapidSubject: string;
}): Promise<number> {

  // 1. Coppia efimera server P-256
  const serverKeyPair = await crypto.subtle.generateKey(
    { name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveKey', 'deriveBits'],
  );
  const serverPublicKeyRaw = new Uint8Array(
    await crypto.subtle.exportKey('raw', serverKeyPair.publicKey)
  );

  // 2. Chiave pubblica subscriber
  const subscriberPublicKeyRaw = base64urlToBytes(p256dh);
  const subscriberPublicKey = await crypto.subtle.importKey(
    'raw', subscriberPublicKeyRaw,
    { name: 'ECDH', namedCurve: 'P-256' },
    false, [],
  );

  // 3. ECDH shared secret (32 byte)
  const sharedSecret = new Uint8Array(
    await crypto.subtle.deriveBits(
      { name: 'ECDH', public: subscriberPublicKey },
      serverKeyPair.privateKey, 256,
    )
  );

  // 4. Salt 16 byte casuale
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // 5. HKDF — RFC 8291 §3.3 schema aes128gcm
  const authSecret = base64urlToBytes(auth);

  // PRK = HKDF-Extract(auth_secret, ECDH_secret)
  // info = "WebPush: info\0" + subscriber_pub + server_pub
  const ikm = await hkdfExtract(authSecret, sharedSecret);
  const prkInfo = concat(
    utf8('WebPush: info\0'),
    subscriberPublicKeyRaw,
    serverPublicKeyRaw,
  );
  const prk = await hkdfExpand(ikm, prkInfo, 32);

  // CEK = HKDF(salt, prk, "Content-Encoding: aes128gcm\0", 16)
  const cekInfo   = utf8('Content-Encoding: aes128gcm\0');
  const nonceInfo = utf8('Content-Encoding: nonce\0');
  const cek   = await hkdfExpand(await hkdfExtract(salt, prk), concat(cekInfo,   new Uint8Array([1])), 16);
  const nonce = await hkdfExpand(await hkdfExtract(salt, prk), concat(nonceInfo, new Uint8Array([1])), 12);

  // 6. Cifra AES-128-GCM
  const aesKey = await crypto.subtle.importKey(
    'raw', cek, { name: 'AES-GCM' }, false, ['encrypt'],
  );
  // RFC 8291: padding delimiter byte 0x02 alla fine del plaintext
  const plaintext = concat(utf8(payload), new Uint8Array([2]));
  const ciphertext = new Uint8Array(
    await crypto.subtle.encrypt({ name: 'AES-GCM', iv: nonce }, aesKey, plaintext)
  );

  // 7. Body RFC 8188: salt(16) + rs(4) + idlen(1) + server_pub(65) + ciphertext
  const rs = new Uint8Array(4);
  new DataView(rs.buffer).setUint32(0, ciphertext.length + 16 + 1, false);

  const encBody = concat(salt, rs, new Uint8Array([65]), serverPublicKeyRaw, ciphertext);

  // 8. VAPID JWT
  const vapidJwt = await buildVapidJwt(endpoint, vapidPublicKey, vapidPrivateKey, vapidSubject);

  // 9. POST all'endpoint push
  const resp = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type':     'application/octet-stream',
      'Content-Encoding': 'aes128gcm',
      'Authorization':    `vapid t=${vapidJwt},k=${vapidPublicKey}`,
      'TTL':              '86400',
    },
    body: encBody,
  });

  return resp.status;
}

// ─── VAPID JWT ES256 ──────────────────────────────────────────────────────────
async function buildVapidJwt(
  endpoint: string,
  pubKey: string,
  privKey: string,
  subject: string,
): Promise<string> {
  const origin = new URL(endpoint).origin;
  const now    = Math.floor(Date.now() / 1000);

  const header = b64url(JSON.stringify({ typ: 'JWT', alg: 'ES256' }));
  const claims = b64url(JSON.stringify({ aud: origin, exp: now + 43200, sub: subject }));

  // FIX: web-push genera chiavi RAW (32 byte), non PKCS8.
  // Dobbiamo wrappare la chiave raw in un envelope PKCS8 prima di importarla.
  const rawPrivBytes = base64urlToBytes(privKey);
  const pkcs8Key = rawPrivateKeyToPkcs8(rawPrivBytes);

  const cryptoKey = await crypto.subtle.importKey(
    'pkcs8', pkcs8Key,
    { name: 'ECDSA', namedCurve: 'P-256' },
    false, ['sign'],
  );

  const sigInput = utf8(`${header}.${claims}`);
  const sigBuf   = await crypto.subtle.sign(
    { name: 'ECDSA', hash: 'SHA-256' }, cryptoKey, sigInput,
  );

  return `${header}.${claims}.${bytesToB64url(new Uint8Array(sigBuf))}`;
}

/**
 * Wrappa una chiave privata P-256 raw (32 byte) nell'envelope PKCS8
 * richiesto da WebCrypto importKey('pkcs8').
 * Header fisso per P-256 (OID 1.2.840.10045.3.1.7).
 */
function rawPrivateKeyToPkcs8(rawKey: Uint8Array): Uint8Array {
  // ECPrivateKey (RFC 5915) per P-256 senza public key opzionale
  const ecPrivateKey = concat(
    new Uint8Array([
      0x30, 0x77,       // SEQUENCE
        0x02, 0x01, 0x01, // INTEGER version=1
        0x04, 0x20,       // OCTET STRING (32 byte)
    ]),
    rawKey,
    new Uint8Array([
      0xa0, 0x0a,       // [0] namedCurve
        0x06, 0x08,       // OID
          0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07, // P-256
      0xa1, 0x44,       // [1] publicKey (placeholder 68 byte, tutti zero)
        0x03, 0x42, 0x00,
        ...new Array(65).fill(0x00),
    ]),
  );

  // PKCS8 envelope (RFC 5958)
  const algorithmIdentifier = new Uint8Array([
    0x30, 0x13,       // SEQUENCE
      0x06, 0x07,       // OID id-ecPublicKey
        0x2a, 0x86, 0x48, 0xce, 0x3d, 0x02, 0x01,
      0x06, 0x08,       // OID P-256
        0x2a, 0x86, 0x48, 0xce, 0x3d, 0x03, 0x01, 0x07,
  ]);

  const pkcs8Body = concat(
    new Uint8Array([0x02, 0x01, 0x00]), // version = 0
    algorithmIdentifier,
    concat(new Uint8Array([0x04, ecPrivateKey.length]), ecPrivateKey),
  );

  return concat(
    new Uint8Array([0x30, pkcs8Body.length]),
    pkcs8Body,
  );
}

// ─── HKDF helpers (WebCrypto) ─────────────────────────────────────────────────
async function hkdfExtract(salt: Uint8Array, ikm: Uint8Array): Promise<Uint8Array> {
  const saltKey = await crypto.subtle.importKey('raw', salt, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', saltKey, ikm));
}

async function hkdfExpand(prk: Uint8Array, info: Uint8Array, length: number): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey('raw', prk, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const result = new Uint8Array(length);
  let prev = new Uint8Array(0);
  let offset = 0, counter = 1;
  while (offset < length) {
    const input = concat(prev, info, new Uint8Array([counter++]));
    prev = new Uint8Array(await crypto.subtle.sign('HMAC', key, input));
    result.set(prev.slice(0, Math.min(prev.length, length - offset)), offset);
    offset += prev.length;
  }
  return result;
}

// ─── Utility ──────────────────────────────────────────────────────────────────
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

function base64urlToBytes(b64url: string): Uint8Array {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/');
  const padded = b64 + '='.repeat((4 - b64.length % 4) % 4);
  return Uint8Array.from(atob(padded), c => c.charCodeAt(0));
}

function b64url(str: string): string {
  return btoa(str).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}

function bytesToB64url(arr: Uint8Array): string {
  return btoa(String.fromCharCode(...arr))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
}
