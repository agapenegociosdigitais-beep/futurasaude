const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fqdhapwfvmmjpzqbkxws.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function getBenef() {
  const { data, error } = await supabase
    .from('beneficiarios')
    .select('id, nome_completo, status')
    .limit(1)
    .single();
  
  if (error) console.error('Erro:', error);
  else console.log(data.id);
}

getBenef();
