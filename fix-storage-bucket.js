const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://eldhtxtnwdanyavkikap.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVsZGh0eHRud2Rhbnlhdmtpa2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzc4NTgsImV4cCI6MjA2OTcxMzg1OH0.Wz7TtwZqZT3m4UCqN9XF1O3ifnrnaOQezXasvZ-uX7Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixStorageBucket() {
  try {
    console.log('🔧 Fixing storage bucket issues...');
    
    // 1. Check existing buckets
    console.log('\n1. Checking existing buckets...');
    const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets();
    
    if (bucketsError) {
      console.error('❌ Error listing buckets:', bucketsError.message);
      return;
    }
    
    console.log('✅ Current buckets:', buckets?.map(b => b.name) || []);
    
    // 2. Check if material bucket exists
    const materialBucket = buckets?.find(b => b.name === 'material');
    
    if (!materialBucket) {
      console.log('\n2. Creating material bucket...');
      const { data: newBucket, error: createError } = await supabase.storage.createBucket('material', {
        public: true,
        allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
        fileSizeLimit: 10485760 // 10MB
      });
      
      if (createError) {
        console.error('❌ Error creating bucket:', createError.message);
        console.log('\n💡 This might be a permissions issue. The bucket might already exist or need admin privileges.');
      } else {
        console.log('✅ Material bucket created successfully');
      }
    } else {
      console.log('✅ Material bucket already exists');
    }
    
    // 3. Test bucket access
    console.log('\n3. Testing bucket access...');
    const { data: files, error: listError } = await supabase.storage.from('material').list();
    
    if (listError) {
      console.error('❌ Error accessing bucket:', listError.message);
    } else {
      console.log('✅ Bucket access successful. Files found:', files?.length || 0);
    }
    
    console.log('\n🎉 Storage bucket check completed!');
    
  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
  }
}

fixStorageBucket();