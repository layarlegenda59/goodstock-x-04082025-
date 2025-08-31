const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local.example
const envPath = path.join(__dirname, '.env.local.example');
let envVars = {};

try {
  const envContent = fs.readFileSync(envPath, 'utf8');
  envContent.split('\n').forEach(line => {
    if (line.trim() && !line.startsWith('#')) {
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    }
  });
} catch (error) {
  console.error('❌ Error reading .env.local.example file:', error.message);
  process.exit(1);
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local.example');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupMaterialBucket() {
  try {
    console.log('🔧 Setting up material bucket...');
    
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }
    
    const materialBucket = buckets.find(bucket => bucket.name === 'material');
    
    if (!materialBucket) {
      console.log('📦 Creating material bucket...');
      
      const { data, error } = await supabase.storage.createBucket('material', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (error) {
        console.error('❌ Error creating bucket:', error.message);
        return;
      }
      
      console.log('✅ Material bucket created successfully');
    } else {
      console.log('✅ Material bucket already exists');
    }
    
    // Test upload to verify bucket is working
    console.log('🧪 Testing bucket access...');
    
    // Create a small test file
    const testContent = Buffer.from('test image content');
    const testFileName = `test-${Date.now()}.txt`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('material')
      .upload(testFileName, testContent, {
        contentType: 'text/plain'
      });
    
    if (uploadError) {
      console.error('❌ Error testing upload:', uploadError.message);
      return;
    }
    
    console.log('✅ Test upload successful');
    
    // Clean up test file
    await supabase.storage.from('material').remove([testFileName]);
    console.log('🧹 Test file cleaned up');
    
    console.log('🎉 Material bucket setup completed successfully!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupMaterialBucket();