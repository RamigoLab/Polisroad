import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Fonti RSS curate (prima vivevano come FEEDS in src/pages/admin/AdminNews.jsx).
// Stanno qui, lato server, cosi' la function non diventa un proxy aperto a URL
// arbitrari passati dal client: fetcha solo queste tre fonti, punto.
const FEEDS = [
  { url: "https://www.asaps.it/rss.php", fonte: "ASAPS", categoria: "sicurezza" },
  { url: "https://www.sicurauto.it/feed/", fonte: "SicurAUTO", categoria: "informativa" },
  { url: "https://www.polizialocale.com/feed/", fonte: "Polizia Locale", categoria: "normativa" },
]

// Estrae i campi utili da un feed RSS 2.0 senza dipendenze esterne
// (sostituisce quello che prima faceva api.rss2json.com).
function parseRss(xml: string) {
  const items: { title: string; link: string; description: string; pubDate: string }[] = []
  const itemBlocks = xml.match(/<item[\s\S]*?<\/item>/g) || []

  const extract = (block: string, tag: string) => {
    const match = block.match(new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i'))
    if (!match) return ''
    return match[1].replace(/^<!\[CDATA\[/, '').replace(/\]\]>$/, '').trim()
  }

  for (const block of itemBlocks) {
    items.push({
      title: extract(block, 'title'),
      link: extract(block, 'link'),
      description: extract(block, 'description') || extract(block, 'content:encoded'),
      pubDate: extract(block, 'pubDate'),
    })
  }
  return items
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Nessun header di autorizzazione' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Sessione non autorizzata' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Solo gli admin possono sincronizzare le news (stesso campo "ruolo" usato da ProtectedRoute lato client)
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('ruolo')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.ruolo !== 'admin') {
      return new Response(JSON.stringify({ error: 'Operazione non consentita' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const feeds = await Promise.all(
      FEEDS.map(async (feed) => {
        try {
          const response = await fetch(feed.url)
          const xml = await response.text()
          return { fonte: feed.fonte, categoria: feed.categoria, items: parseRss(xml) }
        } catch (error) {
          return { fonte: feed.fonte, categoria: feed.categoria, items: [], error: (error as Error).message }
        }
      })
    )

    return new Response(JSON.stringify({ feeds }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
