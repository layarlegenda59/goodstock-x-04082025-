const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read environment variables
const envContent = fs.readFileSync('.env.local.example', 'utf8');
let envVars = {};

envContent.split('\n').forEach(line => {
  if (line.trim() && !line.startsWith('#')) {
    const [key, value] = line.split('=');
    if (key && value) {
      envVars[key.trim()] = value.trim();
    }
  }
});

const supabase = createClient(envVars.NEXT_PUBLIC_SUPABASE_URL, envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets();
  
  if (error) {
    console.error('Error:', error.message);
  } else {
    console.log('Available buckets:');
    data.forEach(bucket => {
      console.log(`- ${bucket.name} (public: ${bucket.public})`);
    });
  }
}

listBuckets();