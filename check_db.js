const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://fqdhapwfvmmjpzqbkxws.supabase.co',
  process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZxZGhhcHdmdm1tanB6cWJreHdzIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTczNDk4NTU0NiwiZXhwIjoyMDUwNTYxNTQ2fQ.example'
);

async function check() {
  const { data, error } = await supabase
    .from('beneficiarios')
    .select('id, nome_completo, status')
    .limit(1);
  
  if (error) console.error('Erro:', error);
  else console.log('Beneficiários:', JSON.stringify(data, null, 2));
}

check();
