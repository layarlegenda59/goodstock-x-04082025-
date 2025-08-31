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

async function checkMaterialBucket() {
  try {
    console.log('🔍 Checking material bucket status...');
    
    // List all buckets
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
      return;
    }
    
    console.log('📦 Available buckets:');
    buckets.forEach(bucket => {
      console.log(`  - ${bucket.name} (public: ${bucket.public})`);
    });
    
    const materialBucket = buckets.find(bucket => bucket.name === 'material');
    
    if (materialBucket) {
      console.log('✅ Material bucket exists!');
      console.log('📋 Bucket details:', materialBucket);
      
      // Test file listing
      const { data: files, error: listFilesError } = await supabase.storage
        .from('material')
        .list();
      
      if (listFilesError) {
        console.error('❌ Error listing files in material bucket:', listFilesError.message);
      } else {
        console.log(`📁 Files in material bucket: ${files.length}`);
        if (files.length > 0) {
          files.slice(0, 5).forEach(file => {
            console.log(`  - ${file.name} (${file.metadata?.size || 'unknown size'})`);
          });
        }
      }
      
      // Test upload with a small file
      console.log('🧪 Testing upload capability...');
      const testContent = Buffer.from('test upload');
      const testFileName = `test-upload-${Date.now()}.txt`;
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('material')
        .upload(testFileName, testContent, {
          contentType: 'text/plain'
        });
      
      if (uploadError) {
        console.error('❌ Upload test failed:', uploadError.message);
        console.log('💡 This might be due to RLS policies or permissions');
      } else {
        console.log('✅ Upload test successful!');
        
        // Clean up test file
        await supabase.storage.from('material').remove([testFileName]);
        console.log('🧹 Test file cleaned up');
      }
      
    } else {
      console.log('❌ Material bucket does not exist');
      console.log('💡 You may need to create it manually in Supabase dashboard');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

checkMaterialBucket();