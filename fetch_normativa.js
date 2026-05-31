import { supabase } from './src/config/supabase.js';

(async () => {
  if (!supabase) {
    console.error('Supabase not configured');
    process.exit(1);
  }
  const step = 1000;
  let from = 0;
  let all = [];
  while (true) {
    const { data, error } = await supabase.from('normativa').select('*').order('ordine').range(from, from + step - 1);
    if (error) {
      console.error('Error fetching normativa:', error);
      break;
    }
    if (!data || data.length === 0) break;
    all = all.concat(data);
    if (data.length < step) break;
    from += step;
  }
  console.log('Total normativa rows fetched:', all.length);
  // Optionally print first few IDs
  console.log('Sample IDs:', all.slice(0,5).map(r=>r.id));
})();
