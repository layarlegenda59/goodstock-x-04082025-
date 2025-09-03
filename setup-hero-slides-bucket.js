const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read environment variables from .env.local
const envPath = path.join(__dirname, '.env.local');
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
  console.error('❌ Error reading .env.local file:', error.message);
  process.exit(1);
}

const supabaseUrl = envVars.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = envVars.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function setupHeroSlidesBucket() {
  console.log('🔧 Setting up hero_slides bucket...');
  
  try {
    // 1. Check if bucket already exists
    console.log('📦 Checking existing buckets...');
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();
    
    if (listError) {
      console.error('❌ Error listing buckets:', listError.message);
    } else {
      console.log('✅ Current buckets:', buckets.map(b => b.name));
      
      const heroSlidesBucketExists = buckets.some(bucket => bucket.id === 'hero_slides');
      if (heroSlidesBucketExists) {
        console.log('✅ hero_slides bucket already exists');
      } else {
        console.log('📦 hero_slides bucket does not exist, will be created via SQL');
      }
    }
    
    // 2. Test bucket access
    console.log('\n🔍 Testing bucket access...');
    const { data: files, error: accessError } = await supabase.storage.from('hero_slides').list();
    
    if (accessError) {
      console.error('❌ Error accessing hero_slides bucket:', accessError.message);
      console.log('💡 Please run the SQL script in database/setup-hero-slides-bucket.sql in Supabase Dashboard');
    } else {
      console.log('✅ hero_slides bucket access successful. Files found:', files?.length || 0);
      
      // 3. Test upload functionality
      console.log('\n🧪 Testing upload functionality...');
      const testFileName = `test-${Date.now()}.txt`;
      const testContent = new Blob(['Test upload for hero_slides bucket'], { type: 'text/plain' });
      
      const { error: uploadError } = await supabase.storage
        .from('hero_slides')
        .upload(testFileName, testContent);
      
      if (uploadError) {
        console.error('❌ Error testing upload:', uploadError.message);
        console.log('💡 Please ensure you are authenticated as admin and RLS policies are set correctly');
      } else {
        console.log('✅ Test upload successful');
        
        // Clean up test file
        await supabase.storage.from('hero_slides').remove([testFileName]);
        console.log('🧹 Test file cleaned up');
      }
    }
    
    console.log('\n📋 Setup Instructions:');
    console.log('1. Copy the SQL script from database/setup-hero-slides-bucket.sql');
    console.log('2. Go to Supabase Dashboard > SQL Editor');
    console.log('3. Paste and run the SQL script');
    console.log('4. Verify the bucket is created and policies are applied');
    
    console.log('\n🎉 Hero slides bucket setup check completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

setupHeroSlidesBucket();